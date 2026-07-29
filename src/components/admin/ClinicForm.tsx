'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Clinic {
  id: string;
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  intro: string;
  tags: string;
  hours: string;
  transport: string;
  parking: string;
  mapUrl: string;
  websiteUrl: string;
  blogUrl: string;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
}

export default function ClinicEditForm({ clinic, canEditSortOrder = false }: { clinic: Clinic | null; canEditSortOrder?: boolean }) {
  const router = useRouter();
  const isNew = !clinic;

  const [form, setForm] = useState({
    name: clinic?.name || '',
    slug: clinic?.slug || '',
    region: clinic?.region || '',
    address: clinic?.address || '',
    phone: clinic?.phone || '',
    intro: clinic?.intro || '',
    tags: (() => { try { return JSON.parse(clinic?.tags || '[]').join(', '); } catch { return ''; } })(),
    hours: (clinic?.hours && clinic.hours !== '{}') ? clinic.hours : '',
    transport: clinic?.transport || '',
    parking: clinic?.parking || '',
    mapUrl: clinic?.mapUrl || '',
    websiteUrl: clinic?.websiteUrl || '',
    blogUrl: clinic?.blogUrl || '',
    sortOrder: clinic?.sortOrder?.toString() || '0',
    lat: clinic?.lat?.toString() || '',
    lng: clinic?.lng?.toString() || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const tags = JSON.stringify(form.tags.split(',').map((t: string) => t.trim()).filter(Boolean));
    const body = {
      ...form,
      tags,
      sortOrder: parseInt(form.sortOrder) || 0,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
    };

    try {
      const url = isNew ? '/api/clinics' : `/api/clinics/${clinic!.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '저장에 실패했습니다.');
      }

      setSuccess('저장되었습니다.');
      if (isNew) {
        const data = await res.json();
        router.push(`/admin/clinics/${data.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">지점명 *</label>
          <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>
        {isNew && (
          <div>
            <label className="block text-sm font-medium mb-1">URL 슬러그 *</label>
            <input className="input-field" value={form.slug} onChange={e => update('slug', e.target.value)} required placeholder="gangnam" />
            <p className="text-xs text-gray-400 mt-1">/clinics/[slug] 형태로 사용됩니다</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">지역 *</label>
          <input className="input-field" value={form.region} onChange={e => update('region', e.target.value)} required placeholder="서울" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">전화번호 *</label>
          <input className="input-field" value={form.phone} onChange={e => update('phone', e.target.value)} required placeholder="02-1234-5678" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">주소 *</label>
        <input className="input-field" value={form.address} onChange={e => update('address', e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">소개글</label>
        <textarea className="input-field" rows={3} value={form.intro} onChange={e => update('intro', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">태그 (쉼표로 구분)</label>
        <input className="input-field" value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="알레르기, 수면, 소아" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">진료시간</label>
        <textarea className="input-field text-sm" rows={4} value={form.hours} onChange={e => update('hours', e.target.value)} placeholder={'예) 월~금 09:00~18:00\n토 09:00~13:00\n일/공휴일 휴진'} />
        <p className="text-xs text-gray-400 mt-1">자유롭게 입력하시면 입력한 그대로 표시됩니다. (여러 줄 입력 가능)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">교통안내</label>
          <textarea className="input-field" rows={2} value={form.transport} onChange={e => update('transport', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">주차안내</label>
          <textarea className="input-field" rows={2} value={form.parking} onChange={e => update('parking', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">지도 링크</label>
          <input className="input-field" value={form.mapUrl} onChange={e => update('mapUrl', e.target.value)} placeholder="https://map.naver.com/..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">위도</label>
          <input className="input-field" value={form.lat} onChange={e => update('lat', e.target.value)} placeholder="37.5665" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">경도</label>
          <input className="input-field" value={form.lng} onChange={e => update('lng', e.target.value)} placeholder="126.9780" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">공식 홈페이지 링크</label>
          <input className="input-field" value={form.websiteUrl} onChange={e => update('websiteUrl', e.target.value)} placeholder="https://example.com" />
          <p className="text-xs text-gray-400 mt-1">지점 홈페이지 주소 (입력 시 지점 카드·상세에 '홈페이지' 버튼 표시)</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">블로그 링크</label>
          <input className="input-field" value={form.blogUrl} onChange={e => update('blogUrl', e.target.value)} placeholder="https://blog.naver.com/..." />
          <p className="text-xs text-gray-400 mt-1">지점 블로그 주소 (입력 시 '블로그' 버튼 표시)</p>
        </div>
      </div>

      {canEditSortOrder && (
        <div>
          <label className="block text-sm font-medium mb-1">노출 순서</label>
          <input className="input-field w-32" type="number" value={form.sortOrder} onChange={e => update('sortOrder', e.target.value)} />
          <p className="text-xs text-gray-400 mt-1">메인 '지점 안내'에 노출되는 순서 (숫자가 작을수록 먼저 표시) · 전체 관리자 전용</p>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '저장 중...' : isNew ? '지점 추가' : '변경사항 저장'}
        </button>
      </div>
    </form>
  );
}
