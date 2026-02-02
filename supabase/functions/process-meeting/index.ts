import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
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
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { recordingId } = await req.json();

    if (!recordingId) {
      throw new Error('Recording ID is required');
    }

    console.log(`Processing meeting analysis for recording: ${recordingId}`);

    // Get the recording with transcription from the database
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', user.id)
      .single();

    if (recordingError || !recording) {
      throw new Error('Recording not found');
    }

    if (!recording.transcription) {
      throw new Error('No transcription available for this recording');
    }

    // Get client info if linked
    let clientInfo = '';
    if (recording.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('first_name, surname, email, occupation, date_of_birth')
        .eq('id', recording.client_id)
        .single();
      
      if (client) {
        clientInfo = `\n\nClient Information:
- Name: ${client.first_name} ${client.surname}
- Email: ${client.email || 'N/A'}
- Occupation: ${client.occupation || 'N/A'}
- Date of Birth: ${client.date_of_birth || 'N/A'}`;
      }
    }

    const analysisPrompt = `You are an AI assistant for financial advisors. Analyze the following meeting transcription and extract structured information.
${clientInfo}

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
  ]
}

Important guidelines:
- Extract actionable items that the advisor needs to complete
- Be specific about follow-up tasks
- Prioritize based on urgency and importance
- Include relevant quotes to provide context
- Use realistic due dates based on the discussion
- Focus on client-centric action items

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
      throw new Error(`Analysis failed: ${errorText}`);
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
      console.error('Raw response:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }

    // Separate summary and action items
    const aiSummary = {
      summary: analysis.summary,
      key_topics: analysis.key_topics || [],
      decisions_made: analysis.decisions_made || [],
      client_facts: analysis.client_facts || {},
      follow_up_date: analysis.follow_up_date
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
      throw new Error('Failed to save analysis');
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
