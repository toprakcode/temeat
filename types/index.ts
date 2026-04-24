export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
};

export type Product = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name_tr: string;
  name_en: string | null;
  name_ar: string | null;
  name_de: string | null;
  name_ru: string | null;
  desc_tr: string | null;
  desc_en: string | null;
  desc_ar: string | null;
  desc_de: string | null;
  desc_ru: string | null;
  price: number;
  is_active: boolean;
  image_url: string | null;
  discount_pct: number;
  calories: number | null;
  prep_time: number | null;
  is_chef_pick: boolean;
  allergens: string[];
  tags: string[];
  serves: number;
  sort_order: number;
};

export type Restaurant = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  plan: "free" | "starter" | "pro";
  hours: string | null;
  wifi_password: string | null;
  theme_color: string | null;
  logo_url: string | null;
  created_at: string;
};
