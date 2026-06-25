import { SnowScript } from "@components/snow-script";
import "@styles/globals.css";
import Footer from "@components/share/footer";
import Navbar from "@components/share/navbar";
import { SITE, SITE_URL } from "@lib/site";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

// Self-hosted at build time, so no render-blocking request to Google Fonts.
// Exposed as CSS variables consumed by globals.css / *.module.css.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: "200",
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE.title,
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE_URL,
    locale: SITE.locale,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: SITE.name }] },
  },
};

// Applied before first paint so a saved "light" choice doesn't flash dark.
// Default (no stored value) stays dark, matching <html class="dark">.
const NO_FLASH_THEME = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme bootstrap must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <script
          async
          defer
          data-website-id="12426aa0-229c-4c65-83d8-03f989e524dd"
          src="https://u.alexng.dev/script.js"
        ></script>

        <meta name="theme-color" content="#000000" />
        <meta charSet="utf-8" />
        <SnowScript />
      </head>
      <body className="bg-white dark:bg-black min-h-screen">
        <Navbar />
        {children}
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
