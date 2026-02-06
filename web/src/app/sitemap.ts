import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://emade.social'
  const currentDate = new Date().toISOString()

  // Fetch dynamic story pages
  let storyUrls: MetadataRoute.Sitemap = []
  try {
    const response = await fetch(`${baseUrl}/api/stories`, { 
      next: { revalidate: 3600 }
    })
    if (response.ok) {
      const stories = await response.json()
      if (Array.isArray(stories)) {
        storyUrls = stories.map((story: any) => ({
          url: `${baseUrl}/stories/${story.slug}`,
          lastModified: currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      }
    }
  } catch (error) {
    console.error('Failed to fetch stories for sitemap:', error)
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/diy`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  return [...staticPages, ...storyUrls]
}
