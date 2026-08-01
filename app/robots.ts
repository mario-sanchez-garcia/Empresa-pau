import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/camino',
          '/camino/',
          '/camino-pau/',
          '/onboarding',
          '/settings',
          '/simulacros',
          '/simulacros/',
          '/examenes',
          '/planning',
          '/zona',
          '/zona/',
          '/checkout',
          '/checkout/',
          '/parent-checkout/',
          '/confirmar-email',
          '/auth/',
          // Enlaces con token: nunca deben acabar en un índice público.
          '/informe/',
          '/liga/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
