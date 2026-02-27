import { NextRequest, NextResponse } from 'next/server';
import { searchQuerySchema } from '@/lib/validators';
import { getSearchProvider } from '@/lib/search';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = rateLimit(`search:${ip}`, 30, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const limit = url.searchParams.get('limit') || '8';

  const parsed = searchQuerySchema.safeParse({ q, limit });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || '잘못된 요청입니다.' },
      { status: 400 }
    );
  }

  try {
    const provider = getSearchProvider();
    const results = await provider.search(parsed.data.q, parsed.data.limit);

    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
