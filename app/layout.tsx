import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      className={`${plusJakarta.variable} h-full antialiased`}
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