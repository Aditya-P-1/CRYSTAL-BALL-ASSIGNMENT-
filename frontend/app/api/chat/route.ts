import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:5000';

  try {
    const body = await req.json();

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMsg = 'The AI assistant is temporarily unavailable. Please try again.';
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        // If HTML or raw text, keep clean user message
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Frontend Next.js API Proxy Error:', error.message || error);
    return NextResponse.json(
      { error: 'The AI backend assistant is initializing or unavailable. Please try again in a few seconds.' },
      { status: 503 }
    );
  }
}
