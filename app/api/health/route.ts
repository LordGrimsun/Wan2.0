import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetUrl = searchParams.get('url');

  if (targetUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        return NextResponse.json({ status: 'connected', url: targetUrl });
      }
    } catch {
      return NextResponse.json({ status: 'unreachable', url: targetUrl }, { status: 502 });
    }
  }

  return NextResponse.json({
    status: 'online',
    version: '2.0.0',
    app: 'Wan 2.0 Studio',
    timestamp: Date.now(),
  });
}
