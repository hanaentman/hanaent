'use client';

import { useState } from 'react';

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (next.length < 6) { setError('새 비밀번호는 6자 이상이어야 합니다.'); return; }
    if (next !== confirm) { setError('새 비밀번호가 일치하지 않습니다.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || '변경에 실패했습니다.'); }
      setSuccess('비밀번호가 변경되었습니다.');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm p-2 rounded">{success}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
        <input className="input-field" type="password" value={current} onChange={e => setCurrent(e.target.value)} autoComplete="current-password" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">새 비밀번호 (6자 이상)</label>
        <input className="input-field" type="password" value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" required minLength={6} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
        <input className="input-field" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required minLength={6} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  );
}
