import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
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

    console.log(`Starting transcription for recording: ${recordingId}`);

    // Get the recording from the database
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

    // Update status to processing
    await supabase
      .from('meeting_recordings')
      .update({ transcription_status: 'processing' })
      .eq('id', recordingId);

    // Download the audio file from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('meeting-recordings')
      .download(recording.recording_url);

    if (downloadError || !audioData) {
      console.error('Download error:', downloadError);
      await supabase
        .from('meeting_recordings')
        .update({ transcription_status: 'failed' })
        .eq('id', recordingId);
      return new Response(
        JSON.stringify({ error: 'Failed to download audio file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Convert audio to base64 for Gemini
    const audioBuffer = await audioData.arrayBuffer();
    const audioBase64 = base64Encode(audioBuffer);

    console.log(`Audio file size: ${audioBuffer.byteLength} bytes`);

    // Use Lovable AI (Gemini) for transcription
    const transcriptionPrompt = `You are a professional transcriptionist. Please transcribe the following audio recording accurately. 
    
Instructions:
- Transcribe all spoken words exactly as they are said
- Include speaker labels if you can identify different speakers (e.g., "Speaker 1:", "Speaker 2:")
- Include timestamps at natural break points in the format [MM:SS]
- Preserve the natural flow of conversation
- Note any non-verbal sounds that are relevant (e.g., [laughter], [pause])

Please provide only the transcription, nothing else.`;

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
            content: [
              {
                type: 'text',
                text: transcriptionPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:audio/webm;base64,${audioBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 8000
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      await supabase
        .from('meeting_recordings')
        .update({ transcription_status: 'failed' })
        .eq('id', recordingId);
      return new Response(
        JSON.stringify({ error: 'Transcription failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const geminiResult = await geminiResponse.json();
    const transcription = geminiResult.choices?.[0]?.message?.content || '';

    console.log(`Transcription completed, length: ${transcription.length} characters`);

    // Update the recording with the transcription
    const { error: updateError } = await supabase
      .from('meeting_recordings')
      .update({
        transcription: transcription,
        transcription_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save transcription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Transcription saved successfully for recording: ${recordingId}`);

    return new Response(
      JSON.stringify({
        success: true,
        recordingId,
        transcriptionLength: transcription.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
