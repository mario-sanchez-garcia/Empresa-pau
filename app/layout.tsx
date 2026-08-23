// AVISO DE COOKIES: Kairo usa cookies técnicas necesarias (sesión Supabase) y, con
// consentimiento previo del usuario, PostHog para analítica de producto. PostHog solo
// se inicializa tras aceptar el banner — ver CookieConsentProvider, que bloquea el SDK
// hasta la aceptación explícita (RGPD art. 5.3 LSSI). No inicializar PostHog fuera de ese flujo.
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import NextTopLoader from 'nextjs-toploader'
import { HintsProvider } from '@/app/lib/onboarding/HintsContext';
import { CookieConsentProvider } from '@/app/lib/analytics/CookieConsentContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Solo para la pantalla de Historial (ver .history-screen en page-client.tsx) —
// el resto de Kairo sigue usando Geist Sans como única familia tipográfica.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kairo-pau.com'
const DESCRIPTION =
  'Tu plan de estudio diario para la PAU, exámenes oficiales reales y corrección con IA que te dice dónde pierdes puntos. Madrid y Cataluña.'

export const metadata: Metadata = {
  // metadataBase permite que og:image y demás rutas relativas se resuelvan
  // a URLs absolutas — sin esto, WhatsApp y Twitter no muestran la imagen.
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Kairo — Prepara tu PAU con corrección por IA',
    template: '%s · Kairo',
  },
  description: DESCRIPTION,
  applicationName: 'Kairo',
  keywords: [
    'PAU', 'EBAU', 'selectividad', 'PAU Madrid', 'PAU Cataluña',
    'exámenes selectividad', 'corrección IA', 'preparar selectividad',
  ],
  authors: [{ name: 'Kairo' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: APP_URL,
    siteName: 'Kairo',
    title: 'Kairo — Prepara tu PAU con corrección por IA',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairo — Prepara tu PAU con corrección por IA',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

// schema.org — Organization + SoftwareApplication, apropiado para un producto
// de software educativo online (no LocalBusiness: Kairo no tiene local físico).
const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kairo',
    url: APP_URL,
    logo: `${APP_URL}/brand/kairo-logo.png`,
    description: DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Kairo',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: APP_URL,
    description: DESCRIPTION,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <NextTopLoader color="#2563eb" height={3} showSpinner={false} shadow={false} />
        <CookieConsentProvider>
          <HintsProvider>
            {children}
          </HintsProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
