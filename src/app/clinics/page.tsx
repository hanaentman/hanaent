import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import ClinicCard from '@/components/public/ClinicCard';
import RegionFinder from '@/components/public/RegionFinder';
import { parseSido, parseGu, sortSido } from '@/lib/address';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '가까운곳 찾기',
  description: '하나이비인후과네트워크 전국 병·의원을 내 지역에서 찾아보세요.',
};

interface PageProps {
  searchParams: { region?: string; sido?: string; gu?: string; sort?: string; q?: string };
}

export default async function ClinicsPage({ searchParams }: PageProps) {
  const { region = '', sido = '', gu = '', sort = 'name', q = '' } = searchParams;

  const orderBy: any = sort === 'updated'
    ? { updatedAt: 'desc' }
    : { name: 'asc' };

  // 42개 규모라 전체를 받아 메모리에서 지역(주소 기반) 필터링
  const all = await prisma.clinic.findMany({
    orderBy,
    include: {
      images: { where: { type: 'HERO' }, take: 1 },
      _count: { select: { doctors: true } },
    },
  });

  // 주소에서 시/도·구 파생
  const enriched = all.map(c => ({
    ...c,
    _sido: parseSido(c.address),
    _gu: parseGu(c.address),
  }));

  // 권역(region) 1차 필터 — 메인 히어로의 지역 노드 클릭 시 사용
  const base = region ? enriched.filter(c => c.region === region) : enriched;

  // 시/도 목록 + 카운트 (권역 필터 반영)
  const sidoCount = new Map<string, number>();
  for (const c of base) sidoCount.set(c._sido, (sidoCount.get(c._sido) || 0) + 1);
  const sidoList = [...sidoCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => sortSido(a.name, b.name));

  // 선택된 시/도 내 구 목록 + 카운트
  const guCount = new Map<string, number>();
  if (sido) {
    for (const c of base) {
      if (c._sido === sido) guCount.set(c._gu, (guCount.get(c._gu) || 0) + 1);
    }
  }
  const guList = [...guCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  // 실제 필터 적용
  const clinics = base.filter(c => {
    if (sido && c._sido !== sido) return false;
    if (gu && c._gu !== gu) return false;
    if (q) {
      const hay = `${c.name} ${c.address}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          가까운곳 찾기{region ? <span className="text-primary-600"> · {region}</span> : ''}
        </h1>
        <p className="mt-2 text-gray-500">내가 사는 지역을 선택하면 가까운 하나이비인후과를 찾아드립니다.</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Suspense fallback={<div className="h-12" />}>
          <RegionFinder sidoList={sidoList} guList={guList} selectedSido={sido} selectedGu={gu} />
        </Suspense>
      </div>

      <div className="mt-6 mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {region ? <><span className="font-semibold text-gray-700">{region}</span> · </> : ''}
          {sido ? <><span className="font-semibold text-gray-700">{sido}{gu ? ` ${gu}` : ''}</span> · </> : ''}
          총 <span className="font-semibold text-gray-700">{clinics.length}</span>개 병·의원
        </p>
        {region && (
          <a href="/clinics" className="text-sm font-medium text-primary-600 hover:underline whitespace-nowrap">전체 지역 보기</a>
        )}
      </div>

      {clinics.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">해당 지역에 아직 병·의원이 없습니다.</p>
          <p className="text-sm mt-2">다른 지역을 선택하거나 전체 목록에서 찾아보세요.</p>
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
                region={clinic._sido}
                address={clinic.address}
                phone={clinic.phone}
                tags={tags}
                heroImage={clinic.images[0]?.url}
                doctorCount={clinic._count.doctors}
                mapUrl={clinic.mapUrl}
                websiteUrl={clinic.websiteUrl}
                blogUrl={clinic.blogUrl}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
