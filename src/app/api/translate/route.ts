import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/openai';
import { TranslationRequest, TranslationResponse } from '@/types/translator';

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, source, target, style = 'formal' } = body;

    if (!text || !target) {
      return NextResponse.json(
        { error: 'Missing required fields: text and target' },
        { status: 400 },
      );
    }

    const startTime = Date.now();
    const translated = await translateText(text, target, style, source);
    const latencyMs = Date.now() - startTime;

    const response: TranslationResponse = {
      translated,
      provider: 'OpenAI',
      latencyMs,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 },
    );
  }
}
