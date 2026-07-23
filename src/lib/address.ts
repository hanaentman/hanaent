// 주소 문자열에서 시/도, 시/군/구를 추출하는 유틸
// 예) "서울 강남구 역삼로 245" → { sido: '서울', gu: '강남구' }
//     "경기 안산시 단원구 광덕대로 174" → { sido: '경기', gu: '안산시' }
//     "광주광역시 서구 금화로 96" → { sido: '광주', gu: '서구' }

// 시/도 정규화 (긴 표기 → 짧은 표기)
const SIDO_MAP: Record<string, string> = {
  서울특별시: '서울', 서울시: '서울', 서울: '서울',
  부산광역시: '부산', 부산시: '부산', 부산: '부산',
  대구광역시: '대구', 대구시: '대구', 대구: '대구',
  인천광역시: '인천', 인천시: '인천', 인천: '인천',
  광주광역시: '광주', 광주시: '광주', 광주: '광주',
  대전광역시: '대전', 대전시: '대전', 대전: '대전',
  울산광역시: '울산', 울산시: '울산', 울산: '울산',
  세종특별자치시: '세종', 세종시: '세종', 세종: '세종',
  경기도: '경기', 경기: '경기',
  강원특별자치도: '강원', 강원도: '강원', 강원: '강원',
  충청북도: '충북', 충북: '충북',
  충청남도: '충남', 충남: '충남',
  전북특별자치도: '전북', 전라북도: '전북', 전북: '전북',
  전라남도: '전남', 전남: '전남',
  경상북도: '경북', 경북: '경북',
  경상남도: '경남', 경남: '경남',
  제주특별자치도: '제주', 제주도: '제주', 제주: '제주',
};

// 필터 표시 순서 (수도권 우선)
export const SIDO_ORDER = [
  '서울', '경기', '인천', '강원', '충북', '충남', '대전', '세종',
  '전북', '전남', '광주', '경북', '경남', '대구', '부산', '울산', '제주',
];

export function parseSido(address: string): string {
  const first = (address || '').trim().split(/\s+/)[0] || '';
  if (SIDO_MAP[first]) return SIDO_MAP[first];
  // 부분 매칭 (예: '광주광역시' 같은 변형)
  for (const key of Object.keys(SIDO_MAP)) {
    if (first.startsWith(key)) return SIDO_MAP[key];
  }
  return first; // 알 수 없으면 원본 첫 토큰
}

export function parseGu(address: string): string {
  const tokens = (address || '').trim().split(/\s+/);
  // 첫 토큰(시/도) 다음에서 구/시/군으로 끝나는 첫 토큰
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i].replace(/,$/, '');
    if (/(구|시|군)$/.test(t)) return t;
  }
  return tokens[1] || '';
}

export function parseRegion(address: string): { sido: string; gu: string } {
  return { sido: parseSido(address), gu: parseGu(address) };
}

// SIDO_ORDER 기준 정렬 (목록에 없으면 뒤로)
export function sortSido(a: string, b: string): number {
  const ia = SIDO_ORDER.indexOf(a);
  const ib = SIDO_ORDER.indexOf(b);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
}
