'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  role: string;
  clinicId: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  clinic: { id: string; name: string } | null;
}

interface ClinicOption {
  id: string;
  name: string;
}

export default function UserManager({ users, clinics }: { users: AdminUser[]; clinics: ClinicOption[] }) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-6">
      {/* 새 계정 생성 */}
      {showNew ? (
        <div className="card p-6 border-primary-200">
          <h3 className="font-bold mb-4">새 관리자 계정</h3>
          <UserCreateForm
            clinics={clinics}
            onCancel={() => setShowNew(false)}
            onCreated={() => { setShowNew(false); router.refresh(); }}
          />
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} className="btn-primary">
          + 관리자 계정 추가
        </button>
      )}

      {/* 계정 목록 */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">아이디</th>
                <th className="text-left p-3 font-medium">역할</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">소속 지점</th>
                <th className="text-center p-3 font-medium">상태</th>
                <th className="text-center p-3 font-medium hidden md:table-cell">마지막 로그인</th>
                <th className="text-right p-3 font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.username}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'SUPER_ADMIN' ? '전체 관리자' : '지점 관리자'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 hidden md:table-cell">{u.clinic?.name || '-'}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="p-3 text-center text-gray-400 text-xs hidden md:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={async () => {
                        const newPw = prompt('새 비밀번호를 입력하세요 (6자 이상):');
                        if (!newPw || newPw.length < 6) { alert('비밀번호는 6자 이상이어야 합니다.'); return; }
                        const res = await fetch('/api/admin/users', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: u.id, password: newPw }),
                        });
                        if (res.ok) alert('비밀번호가 변경되었습니다.');
                        else alert('변경 실패');
                      }}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      비밀번호 재설정
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch('/api/admin/users', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
                        });
                        if (res.ok) router.refresh();
                      }}
                      className={`text-sm hover:underline ${u.isActive ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {u.isActive ? '비활성화' : '활성화'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserCreateForm({
  clinics,
  onCancel,
  onCreated,
}: {
  clinics: ClinicOption[];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'CLINIC_ADMIN' as 'SUPER_ADMIN' | 'CLINIC_ADMIN',
    clinicId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '생성 실패'); }
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">아이디 *</label>
          <input className="input-field" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">비밀번호 *</label>
          <input className="input-field" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">역할 *</label>
          <select className="input-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as any }))}>
            <option value="CLINIC_ADMIN">지점 관리자</option>
            <option value="SUPER_ADMIN">전체 관리자</option>
          </select>
        </div>
        {form.role === 'CLINIC_ADMIN' && (
          <div>
            <label className="block text-sm font-medium mb-1">소속 지점 *</label>
            <select className="input-field" value={form.clinicId} onChange={e => setForm(p => ({ ...p, clinicId: e.target.value }))} required>
              <option value="">지점 선택</option>
              {clinics.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">취소</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '생성 중...' : '계정 생성'}
        </button>
      </div>
    </form>
  );
}
