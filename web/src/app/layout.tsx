import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteNav } from "@/components/SiteNav";
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "E-MADE";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "E-MADE is a youth-led initiative that tackles the growing crisis of electronic waste by collecting, safely recycling, and repurposing discarded electronics. The project reduces toxic pollution from improper dumping and burning of e-waste while transforming valuable components into new products for community use. Through public education, hands-on innovation, and responsible recycling practices, E-MADE protects human health, creates green skills for young people, and promotes a circular economy where electronics are reused instead of wasted.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://emade.social";

const normalizedSiteUrl = siteUrl.startsWith("http://") || siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`;

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  keywords: [
    "e-waste recycling",
    "electronic waste",
    "battery recycling",
    "device recycling",
    "safe e-waste disposal",
    "community recycling",
    "electronic waste management",
    "sustainable electronics",
    "repair and reuse",
    "e-waste safety",
    "electronics repair",
    "responsible recycling",
    "emade",
    "e-made",
  ],
  authors: [{ name: "E-MADE" }],
  creator: "E-MADE",
  publisher: "E-MADE",
  metadataBase: new URL(normalizedSiteUrl),
  alternates: {
    canonical: normalizedSiteUrl,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: normalizedSiteUrl,
    siteName: siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${normalizedSiteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - ${siteDescription}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${normalizedSiteUrl}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const envClass = process.env.NODE_ENV === "production" ? "env-production" : "env-development";
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    description: siteDescription,
    url: normalizedSiteUrl,
    logo: `${normalizedSiteUrl}/logo.png`,
    sameAs: [
      'https://instagram.com/emade.social',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'admin@emade.social',
      contactType: 'customer service',
    },
  };
  
  return (
    <html lang="en" className={`${envClass} dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preload" href="/logo.png" as="image" />
        <meta name="theme-color" content="#05060a" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-surface text-foreground font-sans">
        <ThemeProvider>
          <div className="noise-overlay" aria-hidden />
          <div className="grid-overlay" aria-hidden />
          <SiteNav />
          <main>{children}</main>
          <footer className="relative z-10 border-t border-white/10 bg-surface/50 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">© 2026 E-MADE</span>
                </div>
                <div className="flex items-center gap-6">
                  <a
                    href="https://instagram.com/emade.social"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-300"
                  >
                    Instagram @emade.social
                  </a>
                  <a
                    href="mailto:admin@emade.social"
                    className="text-sm text-slate-300"
                  >
                    admin@emade.social
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
