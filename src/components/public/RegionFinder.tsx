'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface RegionFinderProps {
  sidoList: { name: string; count: number }[];
  guList: { name: string; count: number }[];
  selectedSido: string;
  selectedGu: string;
}

export default function RegionFinder({ sidoList, guList, selectedSido, selectedGu }: RegionFinderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const go = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') params.delete(k);
      else params.set(k, v);
    }
    router.push(`/clinics?${params.toString()}`);
  };

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="space-y-3">
      {/* 1단계: 시/도 */}
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2">지역 선택</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go({ sido: null, gu: null })} className={chip(!selectedSido)}>
            전체
          </button>
          {sidoList.map(s => (
            <button
              key={s.name}
              onClick={() => go({ sido: s.name, gu: null })}
              className={chip(selectedSido === s.name)}
            >
              {s.name}
              <span className={`ml-1 text-xs ${selectedSido === s.name ? 'text-primary-100' : 'text-gray-400'}`}>
                {s.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2단계: 시/군/구 (시/도 선택 시) */}
      {selectedSido && guList.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-400 mb-2">{selectedSido} · 세부 지역</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => go({ gu: null })} className={chip(!selectedGu)}>
              {selectedSido} 전체
            </button>
            {guList.map(g => (
              <button
                key={g.name}
                onClick={() => go({ gu: g.name })}
                className={chip(selectedGu === g.name)}
              >
                {g.name}
                <span className={`ml-1 text-xs ${selectedGu === g.name ? 'text-primary-100' : 'text-gray-400'}`}>
                  {g.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
