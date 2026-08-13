import Link from 'next/link';
import Image from 'next/image';
import { externalUrl } from '@/lib/url';

interface ClinicCardProps {
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  tags: string[];
  heroImage?: string;
  doctorCount: number;
  mapUrl?: string;
  websiteUrl?: string;
  blogUrl?: string;
}

export default function ClinicCard({
  slug, name, region, address, phone, tags, heroImage, doctorCount,
  mapUrl, websiteUrl, blogUrl,
}: ClinicCardProps) {
  return (
    <div className="lift-3d rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <Link href={`/clinics/${slug}`} className="group block">
        <div className="relative h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
          {heroImage ? (
            <Image src={heroImage} alt={name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="text-4xl font-black text-primary-200">H</span>
          )}
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{region}</span>
          </div>
          <h3 className="font-bold text-base group-hover:text-primary-600 transition-colors">{name}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{address}</p>
          <p className="text-sm text-gray-500">{phone}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">의료진 {doctorCount}명</span>
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        </div>
      </Link>

      {/* 액션 링크: 지도 / 홈페이지 / 블로그 / 전화 */}
      <div className="mt-auto flex items-center gap-1.5 px-4 py-3 border-t border-gray-50 flex-wrap">
        {mapUrl && (
          <a href={externalUrl(mapUrl)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            지도
          </a>
        )}
        {websiteUrl && (
          <a href={externalUrl(websiteUrl)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" /></svg>
            홈페이지
          </a>
        )}
        {blogUrl && (
          <a href={externalUrl(blogUrl)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            블로그
          </a>
        )}
        <a href={`tel:${phone}`}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-primary-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          전화
        </a>
      </div>
    </div>
  );
}
