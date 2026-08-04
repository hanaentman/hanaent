import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import { SITE_URL } from '@/lib/site';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '하나이비인후과네트워크 - 전국 이비인후과 통합 네트워크',
    template: '%s | 하나이비인후과네트워크',
  },
  description: '하나이비인후과네트워크 전국 병·의원 안내. 이비인후과 전문 진료, 가까운 병·의원을 찾아보세요.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '하나이비인후과네트워크',
    url: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 본원(강남) 블로그 URL — 헤더 블로그 버튼에 사용
  const hq = await prisma.clinic.findFirst({ where: { slug: 'gangdong' }, select: { blogUrl: true } }).catch(() => null);

  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header blogUrl={hq?.blogUrl || ''} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
