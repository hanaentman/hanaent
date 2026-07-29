import { redirect, notFound } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import ClinicEditForm from '@/components/admin/ClinicForm';
import DoctorManager from '@/components/admin/DoctorForm';
import ImageManager from '@/components/admin/ImageUploader';
import ClinicDeleteButton from '@/components/admin/ClinicDeleteButton';

interface PageProps {
  params: { id: string };
}

export default async function EditClinicPage({ params }: PageProps) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  // "new" 지점 생성
  if (params.id === 'new') {
    return (
      <AdminLayoutWrapper>
        <h1 className="text-2xl font-bold mb-6">새 지점 추가</h1>
        <div className="card p-6">
          <ClinicEditForm clinic={null} />
        </div>
      </AdminLayoutWrapper>
    );
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: params.id },
    include: {
      doctors: { orderBy: { sortOrder: 'asc' } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!clinic) notFound();

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-6">{clinic.name} 편집</h1>

      <div className="space-y-8">
        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">기본 정보</h2>
          <ClinicEditForm clinic={clinic} canEditSortOrder />
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">의료진 관리</h2>
          <DoctorManager clinicId={clinic.id} doctors={clinic.doctors} />
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold mb-4">사진 관리</h2>
          <ImageManager clinicId={clinic.id} images={clinic.images} />
        </section>

        <section className="card p-6 border-red-200">
          <h2 className="text-lg font-bold mb-1 text-red-600">지점 삭제</h2>
          <p className="text-sm text-gray-500 mb-4">삭제하면 이 지점과 소속 의료진·사진이 모두 삭제되며 되돌릴 수 없습니다.</p>
          <ClinicDeleteButton id={clinic.id} name={clinic.name} />
        </section>
      </div>
    </AdminLayoutWrapper>
  );
}
