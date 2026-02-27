import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic } from '@/lib/rbac';
import { getStorage } from '@/lib/storage';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) return NextResponse.json({ error: '의료진을 찾을 수 없습니다.' }, { status: 404 });

  if (!canAccessClinic(user, doctor.clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
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

    // 기존 사진이 있으면 삭제
    if (doctor.photoUrl) {
      await storage.delete(doctor.photoUrl);
    }

    const url = await storage.upload(buffer, file.name, `doctors/${doctor.clinicId}`);

    const updated = await prisma.doctor.update({
      where: { id: params.id },
      data: { photoUrl: url },
    });

    return NextResponse.json({ photoUrl: updated.photoUrl });
  } catch (error) {
    console.error('Doctor photo upload error:', error);
    return NextResponse.json({ error: '사진 업로드에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) return NextResponse.json({ error: '의료진을 찾을 수 없습니다.' }, { status: 404 });

  if (!canAccessClinic(user, doctor.clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    if (doctor.photoUrl) {
      const storage = getStorage();
      await storage.delete(doctor.photoUrl);
    }

    await prisma.doctor.update({
      where: { id: params.id },
      data: { photoUrl: '' },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '사진 삭제에 실패했습니다.' }, { status: 500 });
  }
}
