import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS - restrict to known application domains
const allowedOrigins = [
  'https://vantage-advisor-hub.lovable.app',
  'https://id-preview--d091f7d9-c6a2-4a6f-9460-00caa554b446.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
};

// Input validation schema
const requestSchema = z.object({
  recordingId: z.string().uuid({ message: "recordingId must be a valid UUID" })
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Get the authorization header to verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT using getClaims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const userId = claimsData.claims.sub;

    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.errors }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { recordingId } = validation.data;

    console.log(`Processing meeting analysis for recording: ${recordingId}`);

    // Get the recording with transcription from the database
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', userId)
      .single();

    if (recordingError || !recording) {
      return new Response(
        JSON.stringify({ error: 'Recording not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!recording.transcription) {
      return new Response(
        JSON.stringify({ error: 'No transcription available for this recording' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get client info if linked
    let clientInfo = '';
    let outstandingTasksInfo = '';
    let opportunitiesInfo = '';
    let outstandingTasks: any[] = [];
    let clientOpportunities: any[] = [];

    if (recording.client_id) {
      const [clientRes, tasksRes, oppsRes] = await Promise.all([
        supabase
          .from('clients')
          .select('first_name, surname, email, occupation, date_of_birth')
          .eq('id', recording.client_id)
          .single(),
        supabase
          .from('tasks')
          .select('id, title, task_type, priority, status, due_date')
          .eq('client_id', recording.client_id)
          .eq('is_deleted', false)
          .not('status', 'in', '("Completed","Cancelled")'),
        supabase
          .from('project_opportunities')
          .select('id, opportunity_type, potential_revenue, status, suggested_action, client_name')
          .eq('client_id', recording.client_id),
      ]);

      const client = clientRes.data;
      if (client) {
        clientInfo = `\n\nClient Information:
- Name: ${client.first_name} ${client.surname}
- Email: ${client.email || 'N/A'}
- Occupation: ${client.occupation || 'N/A'}
- Date of Birth: ${client.date_of_birth || 'N/A'}`;
      }

      outstandingTasks = tasksRes.data || [];
      if (outstandingTasks.length > 0) {
        outstandingTasksInfo = `\n\nOutstanding Client Tasks:\n${outstandingTasks.map((t: any) =>
          `- [ID: ${t.id}] "${t.title}" (Type: ${t.task_type}, Priority: ${t.priority}, Status: ${t.status}, Due: ${t.due_date || 'N/A'})`
        ).join('\n')}`;
      }

      clientOpportunities = oppsRes.data || [];
      if (clientOpportunities.length > 0) {
        opportunitiesInfo = `\n\nClient Revenue Opportunities:\n${clientOpportunities.map((o: any) =>
          `- [ID: ${o.id}] "${o.opportunity_type}" (Revenue: $${o.potential_revenue || 0}, Status: ${o.status}, Action: ${o.suggested_action || 'N/A'})`
        ).join('\n')}`;
      }
    }

    const analysisPrompt = `You are an AI assistant for financial advisors. Analyze the following meeting transcription and extract structured information.
${clientInfo}${outstandingTasksInfo}${opportunitiesInfo}

Meeting Title: ${recording.title}
Meeting Date: ${recording.recording_started_at || recording.created_at}

Transcription:
${recording.transcription}

Please analyze this meeting and provide a JSON response with the following structure:
{
  "summary": "A 2-3 sentence summary of the meeting",
  "key_topics": ["Array of main topics discussed"],
  "decisions_made": ["Array of decisions or agreements made"],
  "client_facts": {
    "retirement_date": "If mentioned",
    "financial_goals": ["Array of mentioned goals"],
    "risk_tolerance": "If discussed",
    "life_events": ["Array of upcoming life events mentioned"],
    "family_details": ["Relevant family information mentioned"],
    "concerns": ["Client concerns or worries mentioned"]
  },
  "follow_up_date": "Suggested follow-up date if mentioned or implied (YYYY-MM-DD format)",
  "action_items": [
    {
      "title": "Clear action title",
      "description": "Detailed description of what needs to be done",
      "priority": "High|Medium|Low",
      "suggested_due_date": "YYYY-MM-DD format",
      "task_type": "Follow-up|Document Request|Portfolio Review|Client Complaint|Annual Review|Compliance|Onboarding",
      "source_quote": "The exact quote from the transcription that led to this action item"
    }
  ],
  "tagged_actions": [
    {
      "task_id": "UUID of the outstanding task from the list above, if discussed",
      "task_title": "Title of the task",
      "outcome": "What was discussed or decided about this task",
      "status_suggestion": "Completed|In Progress"
    }
  ],
  "tagged_opportunities": [
    {
      "opportunity_id": "UUID of the opportunity from the list above, or null for new ones",
      "opportunity_name": "Name/type of the opportunity",
      "outcome": "What was discussed about this opportunity",
      "suggested_task": {
        "title": "Follow-up task title",
        "priority": "High|Medium|Low",
        "due_date": "YYYY-MM-DD format"
      }
    }
  ]
}

Important guidelines:
- Extract actionable items that the advisor needs to complete
- Be specific about follow-up tasks
- Prioritize based on urgency and importance
- Include relevant quotes to provide context
- Use realistic due dates based on the discussion
- Focus on client-centric action items
- For tagged_actions: match any discussed topics to the outstanding tasks listed above. Only include tasks that were actually referenced or discussed.
- For tagged_opportunities: match discussed revenue topics to the opportunities listed above. Include new opportunities if identified in the conversation.
- If no outstanding tasks or opportunities were provided, return empty arrays for tagged_actions and tagged_opportunities.

Respond ONLY with valid JSON, no additional text.`;

    const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Analysis failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const geminiResult = await geminiResponse.json();
    let analysisText = geminiResult.choices?.[0]?.message?.content || '';

    // Clean up the response - remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log(`Analysis completed, parsing JSON...`);

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Separate summary and action items
    const aiSummary = {
      summary: analysis.summary,
      key_topics: analysis.key_topics || [],
      decisions_made: analysis.decisions_made || [],
      client_facts: analysis.client_facts || {},
      follow_up_date: analysis.follow_up_date,
      tagged_actions: analysis.tagged_actions || [],
      tagged_opportunities: analysis.tagged_opportunities || [],
    };

    const aiActionItems = analysis.action_items || [];

    // Update the recording with the analysis
    const { error: updateError } = await supabase
      .from('meeting_recordings')
      .update({
        ai_summary: aiSummary,
        ai_action_items: aiActionItems,
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Analysis saved successfully for recording: ${recordingId}`);

    return new Response(
      JSON.stringify({
        success: true,
        recordingId,
        summary: aiSummary,
        actionItems: aiActionItems
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
