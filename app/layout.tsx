import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "FutureBody Trainer",
  description: "Profesjonalne centrum zarządzania pracą trenera personalnego FutureBody.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FutureBody" },
  icons: { icon: "/icon-192.png", apple: "/icon-180.png" },
  openGraph: {
    title: "FutureBody Trainer",
    description: "Twój trening. Twoi klienci. Twój system.",
    images: [{ url: "/futurebody-logo.png", width: 1365, height: 1365, alt: "FutureBody Trainer" }],
  },
  twitter: {
    card: "summary",
    title: "FutureBody Trainer",
    description: "Twój trening. Twoi klienci. Twój system.",
    images: ["/futurebody-logo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem('futurebody_theme')||'dark';var d=p==='system'?matchMedia('(prefers-color-scheme: dark)').matches:p==='dark';document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='dark'}})();` }} />
      </head>
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
