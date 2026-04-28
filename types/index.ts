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
  is_available: boolean;
  image_url: string | null;
  discount_pct: number;
  calories: number | null;
  prep_time: number | null;
  is_chef_pick: boolean;
  allergens: string[];
  tags: string[];
  serves: number;
  sort_order: number;
  extras?: ProductExtra[];
};

export type Restaurant = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  plan: "free" | "yenimekan" | "starter" | "pro";
  hours: string | null;
  wifi_password: string | null;
  theme_color: string | null;
  logo_url: string | null;
  show_reviews?: boolean;
  accept_orders?: boolean;
  order_sound?: boolean;
  table_count?: number;
  created_at: string;
};

export type ProductExtra = {
  id: string;
  product_id: string;
  name_tr: string;
  price: number;
  is_multiple: boolean;
};

export type Order = {
  id: string;
  restaurant_id: string;
  table_no: string;
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  extras_selected: any;
};

export type Review = {
  id: string;
  restaurant_id: string;
  product_id?: string | null;
  customer_name: string;
  rating: number;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  owner_reply: string | null;
  is_public: boolean;
  created_at: string;
};

export type ServiceRequest = {
  id: string;
  restaurant_id: string;
  table_no: string;
  type: string;
  payment_method?: string | null;
  status: "pending" | "resolved";
  created_at: string;
  resolved_at: string | null;
};
