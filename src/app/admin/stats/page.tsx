import { redirect } from 'next/navigation';
import { getSessionUser, isSuperAdmin } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import AdminLayoutWrapper from '@/components/admin/AdminLayout';
import { getCount, dayKey } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  if (!isSuperAdmin(user)) redirect('/admin/clinic');

  // 최근 7일 키
  const dayKeys = [...Array(7)].map((_, i) => dayKey(new Date(Date.now() - i * 86400000)));

  const [homeViews, clinicViews, todayViews, clinics, dayCounters] = await Promise.all([
    getCount('view:home'),
    getCount('view:clinic'),
    getCount(dayKey()),
    prisma.clinic.findMany({ orderBy: { viewCount: 'desc' }, select: { name: true, slug: true, region: true, viewCount: true } }),
    prisma.counter.findMany({ where: { key: { in: dayKeys } } }),
  ]);

  const dayMap = Object.fromEntries(dayCounters.map(c => [c.key, c.count]));
  const days = dayKeys.map(k => ({ date: k.slice(4), count: dayMap[k] || 0 })).reverse();
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const totalViews = homeViews + clinicViews;

  const stats = [
    { label: '전체 조회수', value: totalViews, sub: '홈 + 병·의원 상세' },
    { label: '홈페이지 조회수', value: homeViews, sub: '메인 페이지' },
    { label: '병·의원 상세 조회수', value: clinicViews, sub: '전체 합계' },
    { label: '오늘 조회수', value: todayViews, sub: '오늘(한국시간)' },
  ];

  return (
    <AdminLayoutWrapper>
      <h1 className="text-2xl font-bold mb-1">통계</h1>
      <p className="text-sm text-gray-500 mb-6">홈페이지·병·의원별 조회수 (조회 횟수 기준). 전체 관리자만 볼 수 있습니다.</p>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">{s.value.toLocaleString('ko-KR')}</p>
            <p className="mt-1 text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 최근 7일 추이 */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">최근 7일 조회수</h2>
        <div className="flex items-end gap-2 h-40">
          {days.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500 tabular-nums">{d.count.toLocaleString('ko-KR')}</span>
              <div className="w-full rounded-t bg-primary-500/80" style={{ height: `${Math.round((d.count / maxDay) * 100)}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
              <span className="text-[11px] text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 병·의원별 조회수 순위 */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b"><h2 className="font-bold">병·의원별 조회수 순위</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium w-12">순위</th>
                <th className="text-left p-3 font-medium">병·의원</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">지역</th>
                <th className="text-right p-3 font-medium">조회수</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clinics.map((c, i) => (
                <tr key={c.slug} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{c.region}</td>
                  <td className="p-3 text-right font-semibold tabular-nums">{c.viewCount.toLocaleString('ko-KR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
