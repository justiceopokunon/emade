import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteNav } from "@/components/SiteNav";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "E-MADE";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "E-MADE transforms electronic waste into opportunity through responsible recycling, repair, and community empowerment. Free guides, training, and local programs.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://emade.social";

const normalizedSiteUrl = siteUrl.startsWith("http://") || siteUrl.startsWith("https://") ? siteUrl : `https://${siteUrl}`;

export const metadata: Metadata = {
  title: siteName,
  description: siteDescription,
  metadataBase: new URL(normalizedSiteUrl),
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
    images: [
      {
        url: `${normalizedSiteUrl}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteName} - ${siteDescription}`,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [`${normalizedSiteUrl}/images/og-image.png`],
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
  return (
    <html lang="en" className={`${envClass} dark`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-surface text-foreground">
        <ThemeProvider>
          <div className="noise-overlay" aria-hidden />
          <div className="grid-overlay" aria-hidden />
          <SiteNav />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
