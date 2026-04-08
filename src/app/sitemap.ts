import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    {
      url: `${baseUrl}/homepage`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/product-listing`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/product-detail`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'always',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date('2026-04-08'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}