import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TEMeat — Restoranlar için QR Dijital Menü",
    template: "%s | TEMeat",
  },
  description:
    "TEMeat ile restoranınız için dakikada QR menü oluşturun. 5 dil desteği, WhatsApp sipariş, canlı analitik. Ücretsiz başlayın.",
  keywords: ["qr menü", "dijital menü", "restoran menü", "qr kod menü", "online menü"],
  metadataBase: new URL("https://temeat.vercel.app"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://temeat.vercel.app",
    siteName: "TEMeat",
    title: "TEMeat — Restoranlar için QR Dijital Menü",
    description: "Dakikada QR menü oluşturun. 5 dil, WhatsApp sipariş, analitik. Ücretsiz başlayın.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3WDTN995PL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3WDTN995PL');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}