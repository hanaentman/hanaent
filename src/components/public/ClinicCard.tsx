import Link from 'next/link';

interface ClinicCardProps {
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  tags: string[];
  heroImage?: string;
  doctorCount: number;
}

export default function ClinicCard({ slug, name, region, address, phone, tags, heroImage, doctorCount }: ClinicCardProps) {
  return (
    <Link href={`/clinics/${slug}`} className="card hover:shadow-md transition-shadow group block">
      <div className="h-36 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-3xl font-bold text-primary-300">H</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{region}</span>
        </div>
        <h3 className="font-bold text-base group-hover:text-primary-600 transition-colors">{name}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{address}</p>
        <p className="text-sm text-gray-500">{phone}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">의료진 {doctorCount}명</span>
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
