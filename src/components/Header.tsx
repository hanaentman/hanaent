'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import SearchBar from './SearchBar';
import { externalUrl } from '@/lib/url';

export default function Header({ blogUrl = '' }: { blogUrl?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const blogHref = externalUrl(blogUrl);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="하나이비인후과 로고" width={40} height={40} className="w-9 h-9 rounded-full object-contain" />
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              하나이비인후과 네트워크
            </span>
          </Link>

          {/* 데스크톱 검색 */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-5">
            {blogHref && (
              <a href={blogHref} target="_blank" rel="noopener noreferrer"
                aria-label="파란코끼리세상 블로그"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50 transition-colors">
                <span className="rounded bg-[#03C75A] px-1.5 py-0.5 text-[11px] font-black leading-none text-white">blog</span>
                <span className="hidden lg:inline text-sm font-semibold text-gray-700">파란코끼리세상</span>
              </a>
            )}
            <Link href="/clinics" className="text-gray-600 hover:text-primary-600 font-medium">
              가까운곳 찾기
            </Link>
            <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">
              관리자
            </Link>
          </nav>

          {/* 모바일 버튼 */}
          <div className="flex items-center gap-1 md:hidden">
            {blogHref && (
              <a href={blogHref} target="_blank" rel="noopener noreferrer" aria-label="파란코끼리세상 블로그"
                className="mr-1 rounded bg-[#03C75A] px-1.5 py-1 text-[11px] font-black leading-none text-white">
                blog
              </a>
            )}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="p-2 text-gray-600 hover:text-primary-600"
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600"
              aria-label="메뉴"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3">
            {blogHref && (
              <a href={blogHref} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                <span className="rounded bg-[#03C75A] px-1.5 py-0.5 text-[11px] font-black leading-none text-white">blog</span>
                <span className="text-sm font-semibold text-gray-700">파란코끼리세상</span>
              </a>
            )}
            <Link href="/clinics" className="block py-2 text-gray-600 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>
              가까운곳 찾기
            </Link>
            <Link href="/admin" className="block py-2 text-gray-500 hover:text-gray-700 text-sm" onClick={() => setMobileMenuOpen(false)}>
              관리자
            </Link>
          </div>
        )}
      </div>

      {/* 모바일 풀스크린 검색 오버레이 */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-[60] md:hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-gray-600"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex-1">
                <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
