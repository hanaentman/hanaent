import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import { clinicSchema } from '@/lib/validators';

export async function GET() {
  const clinics = await prisma.clinic.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { doctors: true } } },
  });
  return NextResponse.json(clinics);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = clinicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const existing = await prisma.clinic.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 슬러그입니다.' }, { status: 400 });
  }

  const clinic = await prisma.clinic.create({ data: parsed.data });
  return NextResponse.json(clinic, { status: 201 });
}
