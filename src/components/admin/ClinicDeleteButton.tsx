'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClinicDeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`'${name}'을(를) 정말 삭제하시겠습니까?\n소속 의료진·사진도 함께 삭제되며 되돌릴 수 없습니다.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clinics/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || '삭제에 실패했습니다.');
      }
      router.push('/admin/clinics');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger">
      {loading ? '삭제 중...' : '삭제'}
    </button>
  );
}
