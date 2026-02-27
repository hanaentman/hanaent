import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import ClinicEditForm from '@/components/admin/ClinicForm';
import DoctorManager from '@/components/admin/DoctorForm';
import ImageManager from '@/components/admin/ImageUploader';

export default async function ClinicAdminPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!user.clinicId) redirect('/admin/login');

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    include: {
      doctors: { orderBy: { sortOrder: 'asc' } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!clinic) redirect('/admin/login');

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-6">{clinic.name} 편집</h1>

      <div className="space-y-8">
        {/* 지점 기본 정보 */}
        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">기본 정보</h2>
          <ClinicEditForm clinic={clinic} />
        </section>

        {/* 의료진 관리 */}
        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">의료진 관리</h2>
          <DoctorManager clinicId={clinic.id} doctors={clinic.doctors} />
        </section>

        {/* 이미지 관리 */}
        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">사진 관리</h2>
          <ImageManager clinicId={clinic.id} images={clinic.images} />
        </section>
      </div>
    </AdminLayoutWrapper>
  );
}
