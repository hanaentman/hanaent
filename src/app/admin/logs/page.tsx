import { redirect } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';

export const dynamic = 'force-dynamic';

export default async function AccessLogsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  const logs = await prisma.accessLog.findMany({ orderBy: { createdAt: 'desc' }, take: 300 });

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-1">접속 로그</h1>
      <p className="text-sm text-gray-500 mb-6">관리자 로그인 기록 (최근 300건). 전체 관리자만 볼 수 있습니다.</p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium whitespace-nowrap">시간</th>
                <th className="text-left p-3 font-medium">아이디</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">역할</th>
                <th className="text-center p-3 font-medium">동작</th>
                <th className="text-left p-3 font-medium">IP</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">브라우저</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString('ko-KR')}</td>
                  <td className="p-3 font-medium">{l.username}</td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{l.role === 'SUPER_ADMIN' ? '전체 관리자' : '병·의원 관리자'}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${l.action === 'login' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {l.action === 'login' ? '로그인' : '로그인 실패'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 whitespace-nowrap">{l.ip || '-'}</td>
                  <td className="p-3 text-gray-400 text-xs hidden lg:table-cell max-w-[280px] truncate" title={l.userAgent}>{l.userAgent || '-'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">접속 기록이 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
