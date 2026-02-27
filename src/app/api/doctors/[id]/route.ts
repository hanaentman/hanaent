import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic } from '@/lib/rbac';
import { doctorSchema } from '@/lib/validators';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) return NextResponse.json({ error: '의료진을 찾을 수 없습니다.' }, { status: 404 });

  if (!canAccessClinic(user, doctor.clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = doctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const updated = await prisma.doctor.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const doctor = await prisma.doctor.findUnique({ where: { id: params.id } });
  if (!doctor) return NextResponse.json({ error: '의료진을 찾을 수 없습니다.' }, { status: 404 });

  if (!canAccessClinic(user, doctor.clinicId)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  await prisma.doctor.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
