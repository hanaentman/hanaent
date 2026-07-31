import { redirect } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import UserManager from '@/components/admin/UserForm';

export default async function UsersManagePage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  const [users, clinics] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      include: { clinic: { select: { id: true, name: true } } },
    }),
    prisma.clinic.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-6">계정 관리</h1>
      <UserManager users={users} clinics={clinics} currentUserId={user.id} />
    </AdminLayoutWrapper>
  );
}
