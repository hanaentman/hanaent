import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '관리자',
    template: '%s | 관리자 - 하나이비인후과',
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
