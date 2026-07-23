import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import ClinicCard from '@/components/public/ClinicCard';
import FiltersBar from '@/components/public/FiltersBar';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '지점 찾기',
  description: '하나이비인후과네트워크 전국 지점을 찾아보세요.',
};

interface PageProps {
  searchParams: { region?: string; sort?: string; q?: string };
}

export default async function ClinicsPage({ searchParams }: PageProps) {
  const { region, sort = 'name', q } = searchParams;

  const where: any = {};
  if (region && region !== '전체') {
    where.region = region;
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { address: { contains: q } },
    ];
  }

  const orderBy: any = sort === 'updated'
    ? { updatedAt: 'desc' }
    : sort === 'region'
    ? { region: 'asc' }
    : { name: 'asc' };

  const clinics = await prisma.clinic.findMany({
    where,
    orderBy,
    include: {
      images: { where: { type: 'HERO' }, take: 1 },
      _count: { select: { doctors: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">지점 찾기</h1>

      <Suspense fallback={<div className="h-12" />}>
        <FiltersBar />
      </Suspense>

      <div className="mt-6 mb-4 text-sm text-gray-500">
        총 {clinics.length}개 지점
      </div>

      {clinics.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">해당 조건에 맞는 지점이 없습니다.</p>
          <p className="text-sm mt-2">다른 지역을 선택해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map(clinic => {
            let tags: string[] = [];
            try { tags = JSON.parse(clinic.tags); } catch {}
            return (
              <ClinicCard
                key={clinic.id}
                slug={clinic.slug}
                name={clinic.name}
                region={clinic.region}
                address={clinic.address}
                phone={clinic.phone}
                tags={tags}
                heroImage={clinic.images[0]?.url}
                doctorCount={clinic._count.doctors}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
