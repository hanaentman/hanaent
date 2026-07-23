// 외부 링크 정규화: 프로토콜이 없으면 https:// 를 붙여 절대 URL로 만든다.
// 예) "www.hanaent.co.kr" → "https://www.hanaent.co.kr"
//     "hanaent.co.kr"     → "https://hanaent.co.kr"
//     "https://a.com"     → 그대로
//     "" / null           → ""
export function externalUrl(url?: string | null): string {
  const u = (url || '').trim();
  if (!u) return '';
  // 이미 스킴이 있으면 그대로 (http, https, tel, mailto 등)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) return u;
  // //example.com 형태
  if (u.startsWith('//')) return `https:${u}`;
  return `https://${u}`;
}
