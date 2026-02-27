'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ClinicImage {
  id: string;
  url: string;
  type: string;
  sortOrder: number;
}

export default function ImageManager({ clinicId, images }: { clinicId: string; images: ClinicImage[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'HERO' | 'GALLERY'>('GALLERY');

  const heroImage = images.find(img => img.type === 'HERO');
  const galleryImages = images.filter(img => img.type === 'GALLERY');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clinicId', clinicId);
    formData.append('type', uploadType);

    try {
      const res = await fetch('/api/images', { method: 'POST', body: formData });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '업로드 실패'); }
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) return;
    await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* 대표 이미지 */}
      <div>
        <h3 className="text-sm font-medium mb-2">대표 이미지</h3>
        {heroImage ? (
          <div className="relative inline-block">
            <img src={heroImage.url} alt="대표 이미지" className="h-40 rounded-lg object-cover" />
            <button
              onClick={() => handleDelete(heroImage.id)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">대표 이미지가 없습니다.</div>
        )}
        <div className="mt-2">
          <button
            onClick={() => { setUploadType('HERO'); fileInputRef.current?.click(); }}
            disabled={uploading}
            className="btn-secondary text-sm"
          >
            {uploading ? '업로드 중...' : '대표 이미지 업로드'}
          </button>
        </div>
      </div>

      {/* 갤러리 */}
      <div>
        <h3 className="text-sm font-medium mb-2">갤러리 ({galleryImages.length}장)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {galleryImages.map(img => (
            <div key={img.id} className="relative group">
              <img src={img.url} alt="갤러리" className="aspect-video rounded-lg object-cover w-full" />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button
            onClick={() => { setUploadType('GALLERY'); fileInputRef.current?.click(); }}
            disabled={uploading}
            className="btn-secondary text-sm"
          >
            {uploading ? '업로드 중...' : '갤러리 사진 추가'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
