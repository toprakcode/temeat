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

export const PLANS = {
  free: {
    name: "Ücretsiz",
    price: 0,
    productLimit: 5,
    features: ["basic_qr", "5_langs", "dark_mode", "wifi", "allergens", "calories"],
  },
  yenimekan: {
    name: "Yeni Mekan",
    price: 49,
    productLimit: 10,
    features: ["basic_qr", "5_langs", "dark_mode", "wifi", "allergens", "calories", "analytics", "venue_photos"],
  },
  starter: {
    name: "Başlangıç",
    price: 149,
    productLimit: 25,
    features: ["custom_qr", "5_langs", "dark_mode", "wifi", "allergens", "calories", "analytics", "venue_photos", "chef_picks", "cart", "prep_info", "table_qr_10"],
  },
  pro: {
    name: "Pro",
    price: 299,
    productLimit: Infinity,
    features: ["custom_qr", "5_langs", "dark_mode", "wifi", "allergens", "calories", "analytics", "venue_photos", "chef_picks", "cart", "prep_info", "table_qr_unlimited", "kitchen_panel", "reviews", "recommendations", "white_label"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
