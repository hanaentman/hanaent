'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchResult, ClinicSearchItem, DoctorSearchItem } from '@/types';

interface SearchBarProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export default function SearchBar({ autoFocus = false, onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout>(null!);

  // 전체 결과 목록
  const allItems: Array<{ type: 'clinic'; data: ClinicSearchItem } | { type: 'doctor'; data: DoctorSearchItem }> = [];
  if (results) {
    results.clinics.forEach(c => allItems.push({ type: 'clinic', data: c }));
    results.doctors.forEach(d => allItems.push({ type: 'doctor', data: d }));
  }

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=6`);
      if (res.ok) {
        const data: SearchResult = await res.json();
        setResults(data);
        setIsOpen(true);
        setActiveIndex(-1);
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchResults]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navigate = (url: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(url);
    onNavigate?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allItems.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < allItems.length) {
          const item = allItems[activeIndex];
          if (item.type === 'clinic') {
            navigate(`/clinics/${item.data.slug}`);
          } else {
            navigate(`/clinics/${item.data.clinicSlug}#doctors`);
          }
        } else if (query.trim()) {
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 text-gray-900">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results && query.trim()) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="병·의원, 의료진, 전문분야 검색..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-item-${activeIndex}` : undefined}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 자동완성 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
          role="listbox"
        >
          {allItems.length === 0 && !loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              &apos;{query}&apos;에 대한 검색 결과가 없습니다.
            </div>
          ) : (
            <>
              {results && results.clinics.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">병·의원</div>
                  {results.clinics.map((clinic, i) => (
                    <button
                      key={clinic.id}
                      id={`search-item-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5 ${activeIndex === i ? 'bg-primary-50' : ''}`}
                      onClick={() => navigate(`/clinics/${clinic.slug}`)}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      <span className="font-medium text-sm">{highlightMatch(clinic.name, query)}</span>
                      <span className="text-xs text-gray-500">{highlightMatch(clinic.address, query)}</span>
                    </button>
                  ))}
                </div>
              )}
              {results && results.doctors.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">의료진</div>
                  {results.doctors.map((doctor, di) => {
                    const idx = (results?.clinics.length || 0) + di;
                    return (
                      <button
                        key={doctor.id}
                        id={`search-item-${idx}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5 ${activeIndex === idx ? 'bg-primary-50' : ''}`}
                        onClick={() => navigate(`/clinics/${doctor.clinicSlug}#doctors`)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <span className="font-medium text-sm">
                          {highlightMatch(doctor.name, query)}
                          {doctor.title && <span className="text-gray-500 ml-1">{doctor.title}</span>}
                        </span>
                        <span className="text-xs text-gray-500">
                          {doctor.clinicName} · {doctor.specialties.join(', ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {query.trim() && (
                <button
                  className="w-full text-left px-3 py-2.5 text-sm text-primary-600 hover:bg-primary-50 border-t font-medium"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)}
                >
                  &apos;{query}&apos; 전체 검색 결과 보기 →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
