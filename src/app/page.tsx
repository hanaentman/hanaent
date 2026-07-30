import Link from 'next/link';
import prisma from '@/lib/prisma';
import { parseSido, sortSido } from '@/lib/address';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [clinicCount, allAddresses, recentClinics] = await Promise.all([
    prisma.clinic.count(),
    prisma.clinic.findMany({ select: { address: true } }),
    prisma.clinic.findMany({
      take: 6,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: {
        images: { where: { type: 'HERO' }, take: 1 },
        _count: { select: { doctors: true } },
      },
    }),
  ]);

  // 주소 기반 실제 시/도 목록 (지점찾기 필터와 동일 기준)
  const sidoNames = [...new Set(allAddresses.map(c => parseSido(c.address)))].sort(sortSido);
  const sidoCount = sidoNames.length;

  // 3D 히어로 노드: 실제 시/도를 중앙 허브 둘레 원형으로 배치 (클릭 시 해당 시/도 목록으로 이동)
  const NODES = sidoNames.map((label, i) => {
    const angle = (i / sidoNames.length) * Math.PI * 2 - Math.PI / 2; // 12시 방향부터 시계방향
    const R = 44; // 반지름(%)
    return {
      label,
      x: Math.round((50 + R * Math.cos(angle)) * 10) / 10,
      y: Math.round((50 + R * Math.sin(angle)) * 10) / 10,
    };
  });

  const stats = [
    { value: clinicCount, unit: '개', label: '전국 병·의원' },
    { value: sidoCount, unit: '개', label: '진료 지역(시·도)' },
  ];

  return (
    <div>
      {/* ===== 3D 네트워크 히어로 ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white">
        {/* 배경 장식 */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '38px 38px' }} />
        <div className="pointer-events-none absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-primary-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-[460px] h-[460px] rounded-full bg-primary-500/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* 좌: 카피 */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-5 text-center lg:text-left">
            <img src="/logo.jpg" alt="하나이비인후과 네트워크 로고" className="w-16 h-16 md:w-20 md:h-20 flex-none rounded-full bg-white object-contain shadow-xl ring-4 ring-white/25 lg:mt-[28px]" />
            <div className="min-w-0 w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium text-primary-100 ring-1 ring-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              전국 {clinicCount}개 병·의원, 하나로 연결
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] break-keep">
              하나이비인후과 <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">네트워크</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-primary-100/90 max-w-2xl mx-auto lg:mx-0 break-keep leading-relaxed">
              <span className="block">전국 {clinicCount}개, 하나의 네트워크로 이어집니다.</span>
              <span className="block">어느 곳에서나 동일한 기준의 이비인후과 전문 진료를 만나보세요.</span>
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/clinics"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-lg font-bold text-primary-700 shadow-lg shadow-primary-900/30 transition hover:-translate-y-0.5 hover:shadow-xl">
                가까운곳 찾기
              </Link>
            </div>

            {/* 통계 */}
            <dl className="mt-12 grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
              {stats.map(s => (
                <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur px-3 py-4 text-center ring-1 ring-white/15">
                  <dd className="text-2xl md:text-3xl font-extrabold">
                    {s.value}<span className="text-base font-semibold text-primary-200">{s.unit}</span>
                  </dd>
                  <dt className="mt-1 text-xs md:text-sm text-primary-100/80">{s.label}</dt>
                </div>
              ))}
            </dl>
            </div>
          </div>

          {/* 우: 3D 네트워크 비주얼 */}
          <div className="relative [perspective:1400px]">
            <div className="relative mx-auto w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px] [transform-style:preserve-3d] [transform:rotateX(14deg)_rotateZ(-8deg)]">
              {/* 회전 궤도 링 (장식 — 클릭 통과) */}
              <div className="spin-slow pointer-events-none absolute inset-6 rounded-full border border-white/15" />
              <div className="spin-slow pointer-events-none absolute inset-16 rounded-full border border-dashed border-white/15" style={{ animationDirection: 'reverse' }} />

              {/* 연결선 (허브 → 노드, 클릭 통과) */}
              <svg className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {NODES.map(n => (
                  <line key={n.label} x1="50" y1="50" x2={n.x} y2={n.y}
                    stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" className="line-flow" />
                ))}
              </svg>

              {/* 중앙 허브 */}
              <div className="hub-pulse absolute left-1/2 top-1/2 z-20 flex h-28 w-28 sm:h-32 sm:w-32 flex-col items-center justify-center rounded-3xl bg-white text-primary-700 shadow-2xl shadow-primary-950/50 ring-4 ring-white/40"
                style={{ transform: 'translate(-50%, -50%)' }}>
                <span className="text-3xl sm:text-4xl font-black leading-none">{clinicCount}</span>
                <span className="mt-1 text-[11px] font-bold tracking-wider text-primary-500">ONE NETWORK</span>
                <span className="text-[11px] font-semibold text-gray-400">하나의 네트워크</span>
              </div>

              {/* 시/도 노드 (클릭 시 해당 시·도 병·의원 목록으로 이동) */}
              {NODES.map((n, i) => {
                return (
                  <Link key={n.label} href={`/clinics?sido=${encodeURIComponent(n.label)}`}
                    aria-label={`${n.label} 병·의원 보기`}
                    className={`${i % 2 === 0 ? 'node-float' : 'node-float-lg'} absolute z-30 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-lg ring-1 ring-white/25 backdrop-blur cursor-pointer hover:bg-white/30 hover:ring-white/60 transition-colors`}
                    style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${(i % 5) * 0.5}s` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 하단 곡선 */}
        <div className="relative">
          <svg className="block w-full h-[40px] md:h-[60px]" viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== 통합 네트워크 강점 ===== */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-primary-600">Integrated Care</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold">병·의원, 진료 기준은 하나</h2>
          <p className="mt-3 text-gray-500">
            흩어진 개별 병원이 아니라, 하나의 기준으로 운영되는 통합 네트워크입니다.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '전국 통합 네트워크',
              desc: `전국 ${clinicCount}개 병·의원이 동일한 진료 기준과 시스템으로 연결되어 있습니다.`,
              d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
              grad: 'from-primary-500 to-primary-700',
            },
            {
              title: '전문 의료진',
              desc: '이비인후과 전문의가 병·의원에서 직접 진료합니다.',
              d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              grad: 'from-sky-500 to-primary-600',
            },
            {
              title: '어디서나 높은 수준의 진료',
              desc: '가까운 병·의원 어디를 방문하셔도 높은 수준의 전문 진료를 받으실 수 있습니다.',
              d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
              grad: 'from-indigo-500 to-primary-700',
            },
          ].map(f => (
            <div key={f.title} className="lift-3d rounded-2xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center shadow-lg shadow-primary-500/20`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.d} />
                </svg>
              </div>
              <h3 className="mt-5 font-bold text-lg">{f.title}</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 병·의원 안내 ===== */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">병·의원 안내</h2>
              <p className="mt-2 text-gray-500 text-sm">하나이비인후과네트워크 병·의원을 안내합니다.</p>
            </div>
            <Link href="/clinics" className="hidden sm:inline-flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all">
              전체 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentClinics.map(clinic => (
              <Link
                key={clinic.id}
                href={`/clinics/${clinic.slug}`}
                className="lift-3d group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
                  {clinic.images[0] ? (
                    <img src={clinic.images[0].url} alt={clinic.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-5xl font-black text-primary-200 group-hover:text-primary-300 transition-colors">H</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">{clinic.name}</h3>
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">{clinic.region}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5">{clinic.address}</p>
                  <p className="text-sm text-gray-500">{clinic.phone}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span>의료진 {clinic._count.doctors}명</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {clinicCount > 6 && (
            <div className="text-center mt-10">
              <Link href="/clinics"
                className="inline-flex items-center justify-center rounded-full bg-primary-600 px-8 py-3 font-bold text-white shadow-lg shadow-primary-600/30 transition hover:-translate-y-0.5 hover:bg-primary-700">
                전체 {clinicCount}개 네트워크 보기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: '하나이비인후과네트워크',
            description: `전국 ${clinicCount}개 병·의원의 이비인후과 전문 네트워크`,
            url: SITE_URL,
            medicalSpecialty: 'Otolaryngology',
          }),
        }}
      />
    </div>
  );
}
