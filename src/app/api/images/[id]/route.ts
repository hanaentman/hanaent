import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic } from '@/lib/rbac';
import { getStorage } from '@/lib/storage';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const image = await prisma.clinicImage.findUnique({ where: { id: params.id } });
  if (!image) return NextResponse.json({ error: '이미지를 찾을 수 없습니다.' }, { status: 404 });

  if (!canAccessClinic(user, image.clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const storage = getStorage();
    await storage.delete(image.url);
    await prisma.clinicImage.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '이미지 삭제에 실패했습니다.' }, { status: 500 });
  }
}
