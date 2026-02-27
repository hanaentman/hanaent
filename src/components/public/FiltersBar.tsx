'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

export default function FiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRegion = searchParams.get('region') || '전체';
  const currentSort = searchParams.get('sort') || 'name';

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '전체' && key === 'region') {
      params.delete('region');
    } else {
      params.set(key, value);
    }
    router.push(`/clinics?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {REGIONS.map(region => (
          <button
            key={region}
            onClick={() => updateParams('region', region)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              currentRegion === region
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>
      <select
        value={currentSort}
        onChange={e => updateParams('sort', e.target.value)}
        className="input-field w-auto text-sm"
      >
        <option value="name">이름순</option>
        <option value="region">지역순</option>
        <option value="updated">최근 수정순</option>
      </select>
    </div>
  );
}
