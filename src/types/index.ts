export type Role = 'SUPER_ADMIN' | 'CLINIC_ADMIN';
export type ImageType = 'HERO' | 'GALLERY';

export interface ClinicHours {
  [key: string]: string; // e.g. "월~금": "09:00 - 18:00"
}

export interface SearchResult {
  clinics: ClinicSearchItem[];
  doctors: DoctorSearchItem[];
  total: number;
}

export interface ClinicSearchItem {
  id: string;
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  matchType: 'name' | 'address' | 'tag';
  score: number;
}

export interface DoctorSearchItem {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  clinicId: string;
  clinicSlug: string;
  clinicName: string;
  matchType: 'name' | 'specialty';
  score: number;
}

export interface SessionUser {
  id: string;
  username: string;
  role: Role;
  clinicId: string | null;
}
