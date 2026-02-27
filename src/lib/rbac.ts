import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import type { Role, SessionUser } from '@/types';

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('인증이 필요합니다.');
  return user;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role && user.role !== 'SUPER_ADMIN') {
    throw new Error('권한이 없습니다.');
  }
  return user;
}

export async function requireClinicAccess(clinicId: string): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role === 'SUPER_ADMIN') return user;
  if (user.role === 'CLINIC_ADMIN' && user.clinicId === clinicId) return user;
  throw new Error('해당 지점에 대한 접근 권한이 없습니다.');
}

export function canAccessClinic(user: SessionUser, clinicId: string): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  return user.role === 'CLINIC_ADMIN' && user.clinicId === clinicId;
}

export function isSuperAdmin(user: SessionUser): boolean {
  return user.role === 'SUPER_ADMIN';
}
