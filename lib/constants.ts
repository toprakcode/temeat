export const DEFAULT_COLOR = "#D4470A";

export const ALLERGENS = [
  { key: "gluten", label: "Gluten", icon: "🌾" },
  { key: "sut", label: "Süt", icon: "🥛" },
  { key: "yumurta", label: "Yumurta", icon: "🥚" },
  { key: "findik", label: "Fındık", icon: "🥜" },
  { key: "balik", label: "Balık", icon: "🐟" },
  { key: "kabuklu", label: "Kabuklu", icon: "🦐" },
  { key: "soya", label: "Soya", icon: "🫘" },
  { key: "susam", label: "Susam", icon: "🌱" },
];

export const LANGS = [
  { key: "tr", label: "TR" },
  { key: "en", label: "EN" },
  { key: "ar", label: "عر" },
  { key: "de", label: "DE" },
  { key: "ru", label: "RU" },
] as const;

export type LangKey = typeof LANGS[number]["key"];
