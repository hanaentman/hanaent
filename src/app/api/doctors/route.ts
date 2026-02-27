import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, canAccessClinic } from '@/lib/rbac';
import { doctorSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });

  const body = await req.json();
  const parsed = doctorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  if (!canAccessClinic(user, parsed.data.clinicId)) {
    return NextResponse.json({ error: '해당 지점에 대한 권한이 없습니다.' }, { status: 403 });
  }

  const doctor = await prisma.doctor.create({ data: parsed.data });
  return NextResponse.json(doctor, { status: 201 });
}
