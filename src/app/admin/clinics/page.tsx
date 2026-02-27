import { redirect } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import Link from 'next/link';

export default async function ClinicsManagePage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  const clinics = await prisma.clinic.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { doctors: true, images: true, adminUsers: true } },
    },
  });

  return (
    <AdminLayoutWrapper>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">지점 관리</h1>
        <Link href="/admin/clinics/new" className="btn-primary">새 지점 추가</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">지점명</th>
                <th className="text-left p-3 font-medium">지역</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">전화번호</th>
                <th className="text-center p-3 font-medium">의료진</th>
                <th className="text-center p-3 font-medium hidden md:table-cell">관리자</th>
                <th className="text-center p-3 font-medium">수정일</th>
                <th className="text-right p-3 font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clinics.map(clinic => (
                <tr key={clinic.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{clinic.name}</td>
                  <td className="p-3 text-gray-500">{clinic.region}</td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{clinic.phone}</td>
                  <td className="p-3 text-center">{clinic._count.doctors}</td>
                  <td className="p-3 text-center hidden md:table-cell">{clinic._count.adminUsers}</td>
                  <td className="p-3 text-center text-gray-400 text-xs">
                    {new Date(clinic.updatedAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/clinics/${clinic.id}`} className="text-primary-600 hover:underline text-sm">
                      편집
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
