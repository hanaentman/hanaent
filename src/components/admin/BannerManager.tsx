'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function BannerManager({ currentUrl }: { currentUrl: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(currentUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('이미지 파일만 업로드할 수 있습니다.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('파일 크기는 10MB 이하여야 합니다.'); return; }

    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/settings/banner', { method: 'POST', body: fd });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || '업로드 실패'); }
      const d = await res.json();
      setUrl(d.url);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!confirm('공통 상단 배너 이미지를 제거하시겠습니까?')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings/banner', { method: 'DELETE' });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || '삭제 실패'); }
      setUrl('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}

      <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="상단 배너 미리보기" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            설정된 배너가 없습니다 (각 병원 자체 사진이 표시됩니다)
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading} className="btn-primary">
          {loading ? '처리 중...' : url ? '배너 이미지 변경' : '배너 이미지 업로드'}
        </button>
        {url && (
          <button type="button" onClick={handleRemove} disabled={loading} className="btn-secondary">
            배너 제거
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      <p className="text-xs text-gray-400">
        모든 병원 상세 페이지 상단에 공통으로 표시됩니다. 가로로 긴 이미지(예: 1920×640) 권장 · 위·아래가 잘릴 수 있어 중요한 내용은 가운데에 배치하세요.
      </p>
    </div>
  );
}
