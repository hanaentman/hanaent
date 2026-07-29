import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic, isSuperAdmin } from '@/lib/rbac';
import { clinicUpdateSchema } from '@/lib/validators';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: params.id },
    include: { doctors: true, images: true },
  });
  if (!clinic) return NextResponse.json({ error: '지점을 찾을 수 없습니다.' }, { status: 404 });
  return NextResponse.json(clinic);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  if (!canAccessClinic(user, params.id)) {
    return NextResponse.json({ error: '해당 지점에 대한 권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = clinicUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const data = { ...parsed.data };
  // 노출 순서는 전체 관리자만 변경 가능 (지점 관리자는 기존 값 유지)
  if (!isSuperAdmin(user)) {
    delete data.sortOrder;
  }

  try {
    const clinic = await prisma.clinic.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(clinic);
  } catch {
    return NextResponse.json({ error: '지점 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    await prisma.clinic.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '지점 삭제에 실패했습니다.' }, { status: 500 });
  }
}
