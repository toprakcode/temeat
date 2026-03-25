import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  keywords: [
    "qr menü",
    "dijital menü",
    "restoran menü",
    "qr kod menü",
    "online menü",
    "whatsapp sipariş",
    "türkçe dijital menü",
  ],
  authors: [{ name: "TEMeat" }],
  creator: "TEMeat",
  metadataBase: new URL("https://temeat.com.tr"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://temeat.com.tr",
    siteName: "TEMeat",
    title: "TEMeat — Restoranlar için QR Dijital Menü",
    description:
      "Dakikada QR menü oluşturun. 5 dil, WhatsApp sipariş, analitik. Ücretsiz başlayın.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TEMeat — QR Dijital Menü",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TEMeat — Restoranlar için QR Dijital Menü",
    description:
      "Dakikada QR menü oluşturun. 5 dil, WhatsApp sipariş, analitik.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}