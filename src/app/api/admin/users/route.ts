import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import { adminUserSchema } from '@/lib/validators';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = adminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) {
    return NextResponse.json({ error: '이미 존재하는 아이디입니다.' }, { status: 400 });
  }

  if (parsed.data.role === 'CLINIC_ADMIN' && !parsed.data.clinicId) {
    return NextResponse.json({ error: '지점 관리자는 소속 지점을 선택해야 합니다.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const adminUser = await prisma.adminUser.create({
    data: {
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
      clinicId: parsed.data.clinicId || null,
    },
  });

  return NextResponse.json({ id: adminUser.id, username: adminUser.username }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json();
  const { id, password, isActive } = body;

  if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });

  const data: any = {};

  if (password !== undefined) {
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  if (isActive !== undefined) {
    data.isActive = Boolean(isActive);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: '변경할 항목이 없습니다.' }, { status: 400 });
  }

  await prisma.adminUser.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || !isSuperAdmin(user)) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const id = body.id || new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });

  // 현재 로그인한 계정은 삭제 불가 (잠금 방지)
  if (id === user.id) {
    return NextResponse.json({ error: '현재 로그인한 계정은 삭제할 수 없습니다.' }, { status: 400 });
  }

  try {
    await prisma.adminUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '계정 삭제에 실패했습니다.' }, { status: 500 });
  }
}
