import Image from 'next/image';

interface DoctorCardProps {
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  photoUrl: string;
}

export default function DoctorCard({ name, title, specialties, bio, photoUrl }: DoctorCardProps) {
  return (
    <div className="card p-4 flex gap-4">
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {photoUrl ? (
          <Image src={photoUrl} alt={name} fill sizes="80px" className="object-cover rounded-full" />
        ) : (
          <svg className="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg">{name}</h4>
        {title && <p className="text-sm text-primary-600 font-medium">{title}</p>}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {specialties.map(s => (
              <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
        {bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{bio}</p>}
      </div>
    </div>
  );
}
