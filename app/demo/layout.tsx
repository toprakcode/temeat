import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Canlı Demo",
  description:
    "TEMeat demo menüsünü deneyin. Pro ve ücretsiz sürümü karşılaştırın, 5 dili test edin.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}