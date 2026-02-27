import type { ClinicSearchItem, DoctorSearchItem, SearchResult } from '@/types';

const WEIGHTS = {
  clinicNameExact: 100,
  clinicNamePartial: 80,
  doctorNameExact: 90,
  doctorNamePartial: 70,
  addressMatch: 60,
  specialtyMatch: 50,
  tagMatch: 40,
};

interface RawClinic {
  id: string;
  slug: string;
  name: string;
  region: string;
  address: string;
  phone: string;
  tags: string;
}

interface RawDoctor {
  id: string;
  name: string;
  title: string;
  specialties: string;
  clinicId: string;
  clinic: { slug: string; name: string };
}

export function rankClinics(clinics: RawClinic[], query: string): ClinicSearchItem[] {
  const q = query.toLowerCase();
  const results: ClinicSearchItem[] = [];

  for (const c of clinics) {
    let score = 0;
    let matchType: 'name' | 'address' | 'tag' = 'name';

    const nameLower = c.name.toLowerCase();
    if (nameLower === q) {
      score = WEIGHTS.clinicNameExact;
      matchType = 'name';
    } else if (nameLower.includes(q)) {
      score = WEIGHTS.clinicNamePartial;
      matchType = 'name';
    }

    const addrLower = c.address.toLowerCase();
    if (addrLower.includes(q)) {
      const addrScore = WEIGHTS.addressMatch;
      if (addrScore > score) {
        score = addrScore;
        matchType = 'address';
      } else {
        score = Math.max(score, addrScore);
      }
    }

    try {
      const tags: string[] = JSON.parse(c.tags);
      for (const tag of tags) {
        if (tag.toLowerCase().includes(q)) {
          const tagScore = WEIGHTS.tagMatch;
          if (tagScore > score) {
            score = tagScore;
            matchType = 'tag';
          } else {
            score = Math.max(score, tagScore);
          }
          break;
        }
      }
    } catch {}

    if (score > 0) {
      results.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        region: c.region,
        address: c.address,
        phone: c.phone,
        matchType,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function rankDoctors(doctors: RawDoctor[], query: string): DoctorSearchItem[] {
  const q = query.toLowerCase();
  const results: DoctorSearchItem[] = [];

  for (const d of doctors) {
    let score = 0;
    let matchType: 'name' | 'specialty' = 'name';

    const nameLower = d.name.toLowerCase();
    if (nameLower === q) {
      score = WEIGHTS.doctorNameExact;
    } else if (nameLower.includes(q)) {
      score = WEIGHTS.doctorNamePartial;
    }

    let specialties: string[] = [];
    try {
      specialties = JSON.parse(d.specialties);
    } catch {}

    for (const s of specialties) {
      if (s.toLowerCase().includes(q)) {
        const specScore = WEIGHTS.specialtyMatch;
        if (specScore > score) {
          score = specScore;
          matchType = 'specialty';
        }
        break;
      }
    }

    if (score > 0) {
      results.push({
        id: d.id,
        name: d.name,
        title: d.title,
        specialties,
        clinicId: d.clinicId,
        clinicSlug: d.clinic.slug,
        clinicName: d.clinic.name,
        matchType,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function mergeResults(
  clinics: ClinicSearchItem[],
  doctors: DoctorSearchItem[],
  limit: number
): SearchResult {
  return {
    clinics: clinics.slice(0, limit),
    doctors: doctors.slice(0, limit),
    total: clinics.length + doctors.length,
  };
}
