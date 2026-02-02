import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    console.log(`Starting transcription for recording: ${recordingId}`);

    // Get the recording from the database
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('id', recordingId)
      .eq('user_id', user.id)
      .single();

    if (recordingError || !recording) {
      throw new Error('Recording not found');
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
      throw new Error('Failed to download audio file');
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

    const geminiResponse = await fetch('https://ai.lovable.dev/v1/chat/completions', {
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
      throw new Error(`Transcription failed: ${errorText}`);
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
      throw new Error('Failed to save transcription');
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
