// AVISO DE COOKIES: Kairo solo usa cookies estrictamente necesarias (sesión Supabase).
// No se requiere banner de consentimiento previo para esas cookies (RGPD art. 5.3 LSSI).
// Si en el futuro se añade cualquier analítica de terceros (Google Analytics, Meta Pixel,
// PostHog, Hotjar...) PASA A SER OBLIGATORIO un banner de consentimiento previo y granular
// que BLOQUEE esos scripts hasta la aceptación explícita del usuario. No omitir este paso.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import NextTopLoader from 'nextjs-toploader'
import { HintsProvider } from '@/app/lib/onboarding/HintsContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kairo — Prepara tu EBAU",
  description: "Prepara la EBAU Madrid con exámenes oficiales reales y corrección con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextTopLoader color="#2563eb" height={3} showSpinner={false} shadow={false} />
        <HintsProvider>
          {children}
        </HintsProvider>
      </body>
    </html>
  );
}
