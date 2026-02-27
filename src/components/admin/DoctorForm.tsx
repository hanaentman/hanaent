'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: string;
  name: string;
  title: string;
  specialties: string;
  bio: string;
  photoUrl: string;
  sortOrder: number;
}

export default function DoctorManager({ clinicId, doctors }: { clinicId: string; doctors: Doctor[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      {/* 기존 의료진 목록 */}
      {doctors.map(doctor => (
        <div key={doctor.id} className="border rounded-lg p-4">
          {editing === doctor.id ? (
            <DoctorEditForm
              clinicId={clinicId}
              doctor={doctor}
              onCancel={() => setEditing(null)}
              onSaved={() => { setEditing(null); router.refresh(); }}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {doctor.photoUrl ? (
                    <img src={doctor.photoUrl} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-600 font-bold text-sm">{doctor.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{doctor.name} {doctor.title && <span className="text-gray-500 text-sm">{doctor.title}</span>}</p>
                  <p className="text-xs text-gray-500">
                    {(() => { try { return JSON.parse(doctor.specialties).join(', '); } catch { return ''; } })()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(doctor.id)} className="text-sm text-primary-600 hover:underline">수정</button>
                <button
                  onClick={async () => {
                    if (!confirm('정말 삭제하시겠습니까?')) return;
                    await fetch(`/api/doctors/${doctor.id}`, { method: 'DELETE' });
                    router.refresh();
                  }}
                  className="text-sm text-red-600 hover:underline"
                >삭제</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 새 의료진 추가 */}
      {showNew ? (
        <div className="border rounded-lg p-4 border-primary-200 bg-primary-50/30">
          <DoctorEditForm
            clinicId={clinicId}
            doctor={null}
            onCancel={() => setShowNew(false)}
            onSaved={() => { setShowNew(false); router.refresh(); }}
          />
        </div>
      ) : (
        <button onClick={() => setShowNew(true)} className="btn-secondary w-full">
          + 의료진 추가
        </button>
      )}
    </div>
  );
}

function DoctorEditForm({
  clinicId,
  doctor,
  onCancel,
  onSaved,
}: {
  clinicId: string;
  doctor: Doctor | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isNew = !doctor;
  const [form, setForm] = useState({
    name: doctor?.name || '',
    title: doctor?.title || '',
    specialties: (() => { try { return JSON.parse(doctor?.specialties || '[]').join(', '); } catch { return ''; } })(),
    bio: doctor?.bio || '',
    sortOrder: doctor?.sortOrder?.toString() || '0',
  });
  const [photoPreview, setPhotoPreview] = useState(doctor?.photoUrl || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (doctor && doctor.photoUrl) {
      await fetch(`/api/doctors/${doctor.id}/photo`, { method: 'DELETE' });
    }
    setPhotoPreview('');
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPhoto = async (doctorId: string) => {
    if (!photoFile) return;
    const formData = new FormData();
    formData.append('file', photoFile);
    const res = await fetch(`/api/doctors/${doctorId}/photo`, { method: 'POST', body: formData });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || '사진 업로드 실패');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = {
      clinicId,
      name: form.name,
      title: form.title,
      specialties: JSON.stringify(form.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)),
      bio: form.bio,
      photoUrl: doctor?.photoUrl || '',
      sortOrder: parseInt(form.sortOrder) || 0,
    };

    try {
      const url = isNew ? '/api/doctors' : `/api/doctors/${doctor!.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '저장 실패'); }
      const savedDoctor = await res.json();

      // 사진 파일이 선택된 경우 업로드
      if (photoFile) {
        await uploadPhoto(savedDoctor.id);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</div>}

      {/* 프로필 사진 */}
      <div>
        <label className="block text-sm font-medium mb-2">프로필 사진</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
            {photoPreview ? (
              <img src={photoPreview} alt="미리보기" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              {photoPreview ? '사진 변경' : '사진 첨부'}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-sm text-red-600 hover:underline"
              >
                사진 삭제
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">이름 *</label>
          <input className="input-field" value={form.name} onChange={e => update('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">직책</label>
          <input className="input-field" value={form.title} onChange={e => update('title', e.target.value)} placeholder="원장" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">전문분야 (쉼표 구분)</label>
        <input className="input-field" value={form.specialties} onChange={e => update('specialties', e.target.value)} placeholder="코질환, 알레르기, 수면" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">소개</label>
        <textarea className="input-field" rows={2} value={form.bio} onChange={e => update('bio', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">정렬 순서</label>
        <input className="input-field w-24" type="number" value={form.sortOrder} onChange={e => update('sortOrder', e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">취소</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? '저장 중...' : isNew ? '추가' : '수정'}
        </button>
      </div>
    </form>
  );
}
