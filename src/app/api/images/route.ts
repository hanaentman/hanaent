import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic } from '@/lib/rbac';
import { getStorage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const clinicId = formData.get('clinicId') as string | null;
  const type = (formData.get('type') as string) || 'GALLERY';

  if (!file || !clinicId) {
    return NextResponse.json({ error: '파일과 지점 ID가 필요합니다.' }, { status: 400 });
  }

  if (!canAccessClinic(user, clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: '이미지 파일만 업로드할 수 있습니다.' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하여야 합니다.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    const url = await storage.upload(buffer, file.name, `clinics/${clinicId}`);

    // HERO 타입이면 기존 HERO 삭제
    if (type === 'HERO') {
      const existing = await prisma.clinicImage.findFirst({
        where: { clinicId, type: 'HERO' },
      });
      if (existing) {
        await storage.delete(existing.url);
        await prisma.clinicImage.delete({ where: { id: existing.id } });
      }
    }

    const image = await prisma.clinicImage.create({
      data: { clinicId, url, type },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '이미지 업로드에 실패했습니다.' }, { status: 500 });
  }
}
