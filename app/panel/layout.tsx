import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restoran Paneli",
  description: "TEMeat restoran yönetim paneli.",
  robots: { index: false, follow: false },
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}