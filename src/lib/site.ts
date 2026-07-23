// 사이트 기준 URL (robots / sitemap / 구조화데이터 / OG 에 사용)
// 우선순위: 명시적 SITE_URL > NEXTAUTH_URL > 실제 운영 도메인(vercel.app)
// ※ hana-ent.co.kr 정식 도메인 연결 후에는 NEXT_PUBLIC_SITE_URL 로 교체하면 됨
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://hana-ent.vercel.app';
