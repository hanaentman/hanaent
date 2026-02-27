import prisma from './prisma';
import { rankClinics, rankDoctors, mergeResults } from './searchRank';
import type { SearchResult } from '@/types';

// 검색 인터페이스 (향후 Meilisearch/Algolia 교체 대비)
export interface SearchProvider {
  search(query: string, limit: number): Promise<SearchResult>;
}

// DB 기반 LIKE 검색 (MVP)
class DatabaseSearchProvider implements SearchProvider {
  async search(query: string, limit: number): Promise<SearchResult> {
    const q = `%${query}%`;

    const [clinics, doctors] = await Promise.all([
      prisma.clinic.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { address: { contains: query } },
            { region: { contains: query } },
            { tags: { contains: query } },
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          region: true,
          address: true,
          phone: true,
          tags: true,
        },
      }),
      prisma.doctor.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { specialties: { contains: query } },
          ],
        },
        include: {
          clinic: { select: { slug: true, name: true } },
        },
      }),
    ]);

    const rankedClinics = rankClinics(clinics, query);
    const rankedDoctors = rankDoctors(doctors, query);

    return mergeResults(rankedClinics, rankedDoctors, limit);
  }
}

// 싱글톤 팩토리
let searchProvider: SearchProvider | null = null;

export function getSearchProvider(): SearchProvider {
  if (!searchProvider) {
    // 향후 여기서 환경변수에 따라 다른 provider 사용 가능
    // if (process.env.SEARCH_PROVIDER === 'meilisearch') { ... }
    searchProvider = new DatabaseSearchProvider();
  }
  return searchProvider;
}
