import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import DoctorCard from '@/components/public/DoctorCard';
import { externalUrl } from '@/lib/url';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const clinic = await prisma.clinic.findUnique({ where: { slug: params.slug } });
  if (!clinic) return { title: '병·의원을 찾을 수 없습니다' };

  return {
    title: clinic.name,
    description: `${clinic.name} - ${clinic.address}. ${clinic.intro || '하나이비인후과네트워크'}`,
    openGraph: {
      title: `${clinic.name} | 하나이비인후과네트워크`,
      description: `${clinic.address} · ${clinic.phone}`,
      type: 'website',
    },
  };
}

export default async function ClinicDetailPage({ params }: PageProps) {
  const clinic = await prisma.clinic.findUnique({
    where: { slug: params.slug },
    include: {
      doctors: { orderBy: { sortOrder: 'asc' } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!clinic) notFound();

  // 진료시간: JSON 객체면 항목별로, 아니면 자유 텍스트를 그대로 표시
  const hoursRaw = (clinic.hours || '').trim();
  let hours: Record<string, string> | null = null;
  try {
    const parsed = JSON.parse(hoursRaw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
      hours = parsed as Record<string, string>;
    }
  } catch {}
  const hasHours = hours !== null || (hoursRaw !== '' && hoursRaw !== '{}');
  let tags: string[] = [];
  try { tags = JSON.parse(clinic.tags); } catch {}

  const heroImage = clinic.images.find(img => img.type === 'HERO');
  const galleryImages = clinic.images.filter(img => img.type === 'GALLERY');

  return (
    <div>
      {/* 히어로 */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {heroImage ? (
          <img src={heroImage.url} alt={clinic.name} className="w-full h-full object-contain opacity-80" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-white/20">H</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                {clinic.region}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{clinic.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 상세 정보 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 소개 */}
            {clinic.intro && (
              <section>
                <h2 className="text-xl font-bold mb-3">소개</h2>
                <p className="text-gray-700 whitespace-pre-line">{clinic.intro}</p>
              </section>
            )}

            {/* 태그 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 의료진 */}
            <section id="doctors">
              <h2 className="text-xl font-bold mb-4">의료진 안내</h2>
              {clinic.doctors.length === 0 ? (
                <p className="text-gray-500">등록된 의료진 정보가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinic.doctors.map(doctor => {
                    let specialties: string[] = [];
                    try { specialties = JSON.parse(doctor.specialties); } catch {}
                    return (
                      <DoctorCard
                        key={doctor.id}
                        name={doctor.name}
                        title={doctor.title}
                        specialties={specialties}
                        bio={doctor.bio}
                        photoUrl={doctor.photoUrl}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* 갤러리 */}
            {galleryImages.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">시설 사진</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map(img => (
                    <div key={img.id} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img src={img.url} alt="시설 사진" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="space-y-6">
            {/* CTA */}
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">진료 안내</h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">주소</p>
                    <p className="text-gray-600">{clinic.address}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium">전화</p>
                    <a href={`tel:${clinic.phone}`} className="text-primary-600 hover:underline">{clinic.phone}</a>
                  </div>
                </div>

                {/* 진료시간 */}
                {hasHours && (
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium">진료시간</p>
                      {hours
                        ? Object.entries(hours).map(([day, time]) => (
                            <p key={day} className="text-gray-600">{day}: {time}</p>
                          ))
                        : <p className="text-gray-600 whitespace-pre-line">{hoursRaw}</p>}
                    </div>
                  </div>
                )}

                {/* 교통 */}
                {clinic.transport && (
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <p className="font-medium">교통안내</p>
                      <p className="text-gray-600 whitespace-pre-line">{clinic.transport}</p>
                    </div>
                  </div>
                )}

                {/* 주차 */}
                {clinic.parking && (
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="font-medium">주차안내</p>
                      <p className="text-gray-600">{clinic.parking}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA 버튼 */}
              <div className="mt-6 space-y-2">
                <a
                  href={`tel:${clinic.phone}`}
                  className="btn-primary w-full block text-center"
                >
                  전화 예약
                </a>
                {clinic.mapUrl && (
                  <a
                    href={externalUrl(clinic.mapUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full block text-center"
                  >
                    지도에서 보기
                  </a>
                )}
                {clinic.websiteUrl && (
                  <a
                    href={externalUrl(clinic.websiteUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    공식 홈페이지 방문
                  </a>
                )}
                {clinic.blogUrl && (
                  <a
                    href={externalUrl(clinic.blogUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center rounded-lg border border-green-200 bg-green-50 px-4 py-2 font-medium text-green-700 hover:bg-green-100 transition-colors"
                  >
                    블로그 보기
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalClinic',
            name: clinic.name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: clinic.address,
              addressRegion: clinic.region,
              addressCountry: 'KR',
            },
            telephone: clinic.phone,
            ...(clinic.lat && clinic.lng ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: clinic.lat,
                longitude: clinic.lng,
              },
            } : {}),
            medicalSpecialty: 'Otolaryngology',
            parentOrganization: {
              '@type': 'MedicalOrganization',
              name: '하나이비인후과네트워크',
            },
          }),
        }}
      />
    </div>
  );
}
