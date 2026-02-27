import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function HomePage() {
  const clinicCount = await prisma.clinic.count();
  const recentClinics = await prisma.clinic.findMany({
    take: 6,
    orderBy: { updatedAt: 'desc' },
    include: {
      images: { where: { type: 'HERO' }, take: 1 },
      _count: { select: { doctors: true } },
    },
  });

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            하나이비인후과병원
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            전국 {clinicCount}개 지점에서 이비인후과 전문 진료를 제공합니다.<br />
            가까운 지점을 찾아 편리하게 방문하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/clinics" className="btn-primary text-lg px-8 py-3 bg-white text-primary-700 hover:bg-gray-100 rounded-full font-bold">
              지점 찾기
            </Link>
            <Link href="/search" className="btn-secondary text-lg px-8 py-3 bg-primary-500 text-white hover:bg-primary-400 rounded-full border-0">
              의료진 검색
            </Link>
          </div>
        </div>
      </section>

      {/* 최근 업데이트 지점 */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">지점 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentClinics.map(clinic => (
            <Link
              key={clinic.id}
              href={`/clinics/${clinic.slug}`}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {clinic.images[0] ? (
                  <img src={clinic.images[0].url} alt={clinic.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary-300">H</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg group-hover:text-primary-600 transition-colors">
                  {clinic.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{clinic.address}</p>
                <p className="text-sm text-gray-500">{clinic.phone}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>의료진 {clinic._count.doctors}명</span>
                  <span>·</span>
                  <span>{clinic.region}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {clinicCount > 6 && (
          <div className="text-center mt-8">
            <Link href="/clinics" className="btn-primary inline-block">
              전체 {clinicCount}개 지점 보기
            </Link>
          </div>
        )}
      </section>

      {/* 안내 섹션 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">전국 네트워크</h3>
              <p className="text-gray-600 text-sm">전국 42개 지점에서 동일한 수준의 전문 진료를 제공합니다.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">전문 의료진</h3>
              <p className="text-gray-600 text-sm">이비인후과 전문의가 직접 진료합니다.</p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">편리한 진료</h3>
              <p className="text-gray-600 text-sm">야간·토요 진료로 시간에 맞춰 방문하세요.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalOrganization',
            name: '하나이비인후과병원',
            description: '전국 42개 지점의 이비인후과 전문 병원',
            url: process.env.NEXTAUTH_URL || 'https://hana-ent.co.kr',
            medicalSpecialty: 'Otolaryngology',
          }),
        }}
      />
    </div>
  );
}
