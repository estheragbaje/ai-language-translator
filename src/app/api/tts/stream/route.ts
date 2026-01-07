import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/elevenlabs';
import { TTSRequest } from '@/types/translator';

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, language } = body;

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: text and language' },
        { status: 400 }
      );
    }

    const audioBuffer = await textToSpeech(text, language);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'TTS failed' },
      { status: 500 }
    );
  }
}
