import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    default: '하나이비인후과병원 - 전국 42개 지점',
    template: '%s | 하나이비인후과병원',
  },
  description: '하나이비인후과병원 전국 42개 지점 안내. 이비인후과 전문 진료, 가까운 지점을 찾아보세요.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '하나이비인후과병원',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
