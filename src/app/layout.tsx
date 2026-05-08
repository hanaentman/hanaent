import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: {
    default: 'Sung Joon Kim | Photographer',
    template: '%s | Sung Joon Kim',
  },
  description: 'Fine art photographer Sung Joon Kim portfolio website.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
