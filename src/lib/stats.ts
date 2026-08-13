import prisma from './prisma';

// 봇/크롤러 제외용
const BOT = /(bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebookexternalhit|preview|monitor|lighthouse|headless|curl|wget|python-requests)/i;
export const isBot = (ua?: string | null) => !!ua && BOT.test(ua);

// KST(한국시간) 기준 날짜 키
export function dayKey(d: Date = new Date()): string {
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return 'day:' + kst.toISOString().slice(0, 10);
}

// 여러 카운터 +1 (실패해도 페이지에 영향 없게 무시)
export async function bumpCounters(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map(key =>
      prisma.counter
        .upsert({ where: { key }, update: { count: { increment: 1 } }, create: { key, count: 1 } })
        .catch(() => {})
    )
  );
}

export async function getCount(key: string): Promise<number> {
  try {
    const c = await prisma.counter.findUnique({ where: { key } });
    return c?.count || 0;
  } catch {
    return 0;
  }
}
