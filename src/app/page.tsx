import Link from 'next/link';
import Image from 'next/image';
import { Nanum_Myeongjo } from 'next/font/google';
import prisma from '@/lib/prisma';

// 병원 신뢰감을 주는 명조(세리프) 서체 — 히어로 슬로건용
const trustSerif = Nanum_Myeongjo({ subsets: ['latin'], weight: ['700', '800'], display: 'swap' });
import { parseSido, sortSido } from '@/lib/address';
import { SITE_URL } from '@/lib/site';
import { KOREA_PROVINCES, projectKorea } from '@/lib/korea-map';

export const dynamic = 'force-dynamic';

// 시드 기반 결정적 셔플(Fisher-Yates + mulberry32) — 같은 시드면 항상 같은 순서
function seededShuffle<T>(arr: T[], seed: number): T[] {
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default async function HomePage() {
  const allClinics = await prisma.clinic.findMany({
    include: {
      images: { where: { type: 'HERO' }, take: 1 },
      _count: { select: { doctors: true } },
    },
  });

  const clinicCount = allClinics.length;

  // 주소 기반 실제 시/도 목록 (지점찾기 필터와 동일 기준)
  const sidoNames = [...new Set(allClinics.map(c => parseSido(c.address)))].sort(sortSido);
  const sidoCount = sidoNames.length;

  // '병·의원 안내' 6곳: 주간 시드 기반 랜덤 (같은 주엔 고정, 매주 교체)
  const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const recentClinics = seededShuffle(allClinics, weekSeed).slice(0, 6);

  // 히어로 지도: 시/도를 실제 지리 위치로 투영 + 뒤에 한국 지도 실루엣(같은 좌표계)
  const sidoGeo = new Map<string, { lat: number; lon: number; n: number }>();
  for (const c of allClinics) {
    if (c.lat == null || c.lng == null) continue;
    const s = parseSido(c.address);
    const g = sidoGeo.get(s) || { lat: 0, lon: 0, n: 0 };
    g.lat += c.lat; g.lon += c.lng; g.n += 1;
    sidoGeo.set(s, g);
  }
  // 가까이 붙는 지역은 라벨이 겹치지 않게 살짝 벌림(%)
  const OFFSET: Record<string, [number, number]> = {
    서울: [-3, -4.5], 경기: [4, 3], 부산: [1.5, 5], 경남: [-4.5, -1], 울산: [2.5, -3],
  };
  const NODES = [...sidoGeo.entries()].map(([label, g]) => {
    const p = projectKorea(g.lon / g.n, g.lat / g.n);
    const o = OFFSET[label] || [0, 0];
    return { label, x: +(p.x + o[0]).toFixed(1), y: +(p.y + o[1]).toFixed(1) };
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
            <Image src="/logo.jpg" alt="하나이비인후과 네트워크 로고" width={96} height={96} priority className="w-16 h-16 md:w-20 md:h-20 flex-none rounded-full bg-white object-contain shadow-xl ring-4 ring-white/25 lg:mt-[28px]" />
            <div className="min-w-0 w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium text-primary-100 ring-1 ring-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              전국 {clinicCount}개 병·의원, 하나로 연결
            </span>
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1] break-keep">
              하나이비인후과 <span className="bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">네트워크</span>
            </h1>
            <p className={`${trustSerif.className} mt-5 text-3xl md:text-[2.6rem] font-extrabold leading-snug tracking-tight break-keep`}>
              더 가까이에서,<br />더 깊이 있는 진료
            </p>
            <p className="mt-4 max-w-xl mx-auto lg:mx-0 text-sm md:text-base text-primary-100/85 break-keep leading-relaxed">
              전국 {clinicCount}개 하나이비인후과가 축적된 진료 경험과 의료 지식을 공유하며 우리 가족의 귀·코·목 건강을 함께 지킵니다.
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

          {/* 우: 한국 지도형 네트워크 비주얼 — 시/도를 실제 지리 위치에 배치, 클릭 시 이동 */}
          <div className="relative">
            <div className="relative mx-auto w-[300px] h-[406px] sm:w-[360px] sm:h-[487px] md:w-[400px] md:h-[541px]">
              {/* 남한 시·도 지도 (실제 GeoJSON, 클릭 통과) */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="landFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(255,255,255,0.24)" />
                    <stop offset="1" stopColor="rgba(255,255,255,0.09)" />
                  </linearGradient>
                  <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0.5" stdDeviation="0.7" floodColor="rgba(2,10,40,0.5)" />
                  </filter>
                </defs>
                <g filter="url(#landShadow)">
                  {KOREA_PROVINCES.map(p => (
                    <path key={p.name} d={p.d} fill="url(#landFill)"
                      stroke="rgba(255,255,255,0.28)" strokeWidth="0.25" strokeLinejoin="round" />
                  ))}
                </g>
              </svg>

              {/* 시/도 노드 (지리적 위치, 고정) */}
              {NODES.map(n => (
                <div key={n.label} className="absolute z-30"
                  style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <Link href={`/clinics?sido=${encodeURIComponent(n.label)}`}
                    aria-label={`${n.label} 병·의원 보기`}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-xs sm:text-sm font-bold text-primary-800 shadow-md ring-1 ring-black/5 hover:bg-white hover:scale-110 transition-transform">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {n.label}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-primary-100/70">지역을 누르면 해당 지역 병·의원이 보입니다</p>
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
                <div className="relative h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
                  {clinic.images[0] ? (
                    <>
                      <Image src={clinic.images[0].url} alt="" aria-hidden fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover scale-110 blur-xl" />
                      <Image src={clinic.images[0].url} alt={clinic.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
                    </>
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
