import { redirect } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  const [clinicCount, doctorCount, adminCount, recentClinics] = await Promise.all([
    prisma.clinic.count(),
    prisma.doctor.count(),
    prisma.adminUser.count(),
    prisma.clinic.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { doctors: true, images: true } } },
    }),
  ]);

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-500">전체 병·의원</p>
          <p className="text-3xl font-bold text-primary-600">{clinicCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">전체 의료진</p>
          <p className="text-3xl font-bold text-primary-600">{doctorCount}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">관리자 계정</p>
          <p className="text-3xl font-bold text-primary-600">{adminCount}</p>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="flex gap-3 mb-8">
        <Link href="/admin/clinics" className="btn-primary">네트워크 관리</Link>
        <Link href="/admin/users" className="btn-secondary">계정 관리</Link>
      </div>

      {/* 최근 수정 병·의원 */}
      <div className="card">
        <div className="p-4 border-b">
          <h2 className="font-bold">최근 수정된 병·의원</h2>
        </div>
        <div className="divide-y">
          {recentClinics.map(clinic => (
            <div key={clinic.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{clinic.name}</p>
                <p className="text-sm text-gray-500">{clinic.region} · 의료진 {clinic._count.doctors}명 · 사진 {clinic._count.images}장</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {new Date(clinic.updatedAt).toLocaleDateString('ko-KR')}
                </p>
                <Link href={`/admin/clinics/${clinic.id}`} className="text-sm text-primary-600 hover:underline">
                  편집
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
