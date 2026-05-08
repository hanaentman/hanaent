'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Profile', href: '/profile' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-5">
        <nav className="flex items-center gap-6 text-sm uppercase tracking-[0.2em] text-gray-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? 'text-white' : 'transition hover:text-white'}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
