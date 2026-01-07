import { NextRequest, NextResponse } from 'next/server';
import { speechToText } from '@/lib/openai'; // Using OpenAI Whisper for better STT

export async function POST(request: NextRequest) {
  try {
    // Get audio data from request body
    const arrayBuffer = await request.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Validate audio data
    if (audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'No audio data received' },
        { status: 400 }
      );
    }

    // Get optional parameters from query string
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const prompt = searchParams.get('prompt') || undefined;

    // Perform speech-to-text conversion
    const startTime = Date.now();
    const text = await speechToText(audioBuffer, {
      language,
      prompt,
      temperature: 0, // Deterministic output
    });
    const latencyMs = Date.now() - startTime;

    // Return successful response
    return NextResponse.json({
      text,
      timestamp: Date.now(),
      latencyMs,
      language,
      audioSize: audioBuffer.length,
    });
  } catch (error) {
    console.error('STT error:', error);

    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'STT failed';
    const statusCode = errorMessage.includes('quota')
      ? 429
      : errorMessage.includes('format')
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: Date.now(),
      },
      { status: statusCode }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
