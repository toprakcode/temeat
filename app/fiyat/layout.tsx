import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description:
    "TEMeat fiyat planları: Ücretsiz, Başlangıç ₺149/ay, Profesyonel ₺299/ay. 14 gün ücretsiz deneyin.",
};

export default function FiyatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}