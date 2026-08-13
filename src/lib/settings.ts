import prisma from './prisma';

// 사이트 전역 설정 키
export const SETTING_DETAIL_BANNER = 'detailBanner'; // 상세 페이지 공통 상단 배너 이미지 URL

export async function getSetting(key: string): Promise<string> {
  try {
    const s = await prisma.siteSetting.findUnique({ where: { key } });
    return s?.value || '';
  } catch {
    return '';
  }
}
