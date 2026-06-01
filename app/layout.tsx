import { SnowScript } from "@components/snow-script";
import "@styles/globals.css";
import Footer from "@components/share/footer";
import { ThemeToggle } from "@components/theme-toggle";

// Applied before first paint so a saved "light" choice doesn't flash dark.
// Default (no stored value) stays dark, matching <html class="dark">.
const NO_FLASH_THEME = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme bootstrap must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME }} />
        <script
          async
          defer
          data-website-id="7e5a062e-24a4-4cab-a44c-62848758bec9"
          src="https://umami.ayo.icu/script.js"
        ></script>

        <meta name="theme-color" content="#000000" />
        <meta property="og:type" content="website" />
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon.png" />

        <link rel="icon" href="/favicon.ico" />
        <SnowScript />
      </head>
      <body className="bg-white dark:bg-black min-h-screen">
        <ThemeToggle />
        {children}
        <Footer />
      </body>
    </html>
  );
}
