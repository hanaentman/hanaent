import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // /admin/login은 인증 불필요
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // 인증되지 않은 사용자
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // CLINIC_ADMIN이 SUPER_ADMIN 전용 페이지 접근 차단
    const superAdminPaths = ['/admin/clinics', '/admin/users', '/admin/logs'];
    if (token.role === 'CLINIC_ADMIN') {
      for (const path of superAdminPaths) {
        if (pathname.startsWith(path)) {
          return NextResponse.redirect(new URL('/admin/clinic', req.url));
        }
      }
      // SUPER_ADMIN 대시보드 접근 시 자기 지점 편집으로 리다이렉트
      if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/clinic', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // /admin/login은 항상 허용
        if (req.nextUrl.pathname === '/admin/login') return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*'],
};
