import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import { getStorage } from '@/lib/storage';
import { SETTING_DETAIL_BANNER } from '@/lib/settings';

// 상세 페이지 공통 상단 배너 업로드 (전체 관리자 전용)
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();

    // 기존 배너 삭제
    const prev = await prisma.siteSetting.findUnique({ where: { key: SETTING_DETAIL_BANNER } });
    if (prev?.value) await storage.delete(prev.value);

    const url = await storage.upload(buffer, file.name, 'site');
    await prisma.siteSetting.upsert({
      where: { key: SETTING_DETAIL_BANNER },
      update: { value: url },
      create: { key: SETTING_DETAIL_BANNER, value: url },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Banner upload error:', error);
    return NextResponse.json({ error: '배너 업로드에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const prev = await prisma.siteSetting.findUnique({ where: { key: SETTING_DETAIL_BANNER } });
    if (prev?.value) {
      const storage = getStorage();
      await storage.delete(prev.value);
    }
    await prisma.siteSetting.upsert({
      where: { key: SETTING_DETAIL_BANNER },
      update: { value: '' },
      create: { key: SETTING_DETAIL_BANNER, value: '' },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '배너 삭제에 실패했습니다.' }, { status: 500 });
  }
}
