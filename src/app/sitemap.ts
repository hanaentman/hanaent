import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const clinics = await prisma.clinic.findMany({
    select: { slug: true, updatedAt: true },
  });

  const clinicUrls = clinics.map(clinic => ({
    url: `${baseUrl}/clinics/${clinic.slug}`,
    lastModified: clinic.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/clinics`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...clinicUrls,
  ];
}
