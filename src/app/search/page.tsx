import type { Metadata } from 'next';
import Link from 'next/link';
import { getSearchProvider } from '@/lib/search';

interface PageProps {
  searchParams: { q?: string };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  return {
    title: searchParams.q ? `'${searchParams.q}' 검색 결과` : '검색',
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || '';

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">통합 검색</h1>
        <p className="text-gray-500">검색어를 입력해주세요.</p>
        <p className="text-sm text-gray-400 mt-2">병·의원명, 주소, 의료진명, 전문분야 등으로 검색할 수 있습니다.</p>
      </div>
    );
  }

  const provider = getSearchProvider();
  const results = await provider.search(query, 50);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        &apos;{query}&apos; 검색 결과
      </h1>
      <p className="text-sm text-gray-500 mb-8">총 {results.total}건</p>

      {results.total === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-500">&apos;{query}&apos;에 대한 검색 결과가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">다른 검색어를 입력해보세요.</p>
          <div className="mt-6">
            <Link href="/clinics" className="btn-primary inline-block">전체 병·의원 보기</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 병·의원 결과 */}
          {results.clinics.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                병·의원 ({results.clinics.length})
              </h2>
              <div className="space-y-3">
                {results.clinics.map(clinic => (
                  <Link
                    key={clinic.id}
                    href={`/clinics/${clinic.slug}`}
                    className="card p-4 block hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base">{clinic.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{clinic.address}</p>
                        <p className="text-sm text-gray-500">{clinic.phone}</p>
                      </div>
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">{clinic.region}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 의료진 결과 */}
          {results.doctors.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                의료진 ({results.doctors.length})
              </h2>
              <div className="space-y-3">
                {results.doctors.map(doctor => (
                  <Link
                    key={doctor.id}
                    href={`/clinics/${doctor.clinicSlug}#doctors`}
                    className="card p-4 block hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base">
                          {doctor.name}
                          {doctor.title && <span className="text-gray-500 font-normal ml-2">{doctor.title}</span>}
                        </h3>
                        <p className="text-sm text-primary-600 mt-1">{doctor.clinicName}</p>
                        {doctor.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doctor.specialties.map(s => (
                              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
