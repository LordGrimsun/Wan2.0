import { NextRequest, NextResponse } from 'next/server';
import { enhancePromptForModel } from '@/lib/promptEnhancer';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();
    const result = enhancePromptForModel(prompt || '', model || 'wan-2.1-14b');
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
