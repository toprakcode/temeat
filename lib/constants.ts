export const DEFAULT_COLOR = "#D4470A";

export const ALLERGENS = [
  { key: "gluten", label: "Gluten" },
  { key: "sut", label: "Süt" },
  { key: "yumurta", label: "Yumurta" },
  { key: "findik", label: "Fındık" },
  { key: "balik", label: "Balık" },
  { key: "kabuklu", label: "Kabuklu" },
  { key: "soya", label: "Soya" },
  { key: "susam", label: "Susam" },
];

export const LANGS = [
  { key: "tr", label: "TR" },
  { key: "en", label: "EN" },
  { key: "ar", label: "عر" },
  { key: "de", label: "DE" },
  { key: "ru", label: "RU" },
] as const;

export type LangKey = typeof LANGS[number]["key"];
