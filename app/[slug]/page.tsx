import React from "react";
import { supabase } from "@/lib/supabase";
import { Restaurant, Category, Product, Review } from "@/types";
import MenuClient from "@/app/[slug]/MenuClient";
import { Metadata } from "next";

// Dinamik meta veriler (SEO için)
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params;
  const { data: rest } = await supabase.from("restaurants").select("name").eq("slug", slug).single();
  return {
    title: rest ? `${rest.name} Menüsü | TEMeat` : "Menü | TEMeat",
  };
}

export default async function MenuPage({ params, searchParams }: any) {
  const { slug } = await params;
  const { table } = await searchParams;

  // Verileri sunucu taraflı çekiyoruz (Daha hızlı ve güvenli)
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("slug", slug).single();

  if (!restaurant) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Menü bulunamadı</h1>
          <p style={{ color: "#999" }}>Bu adrese ait bir restoran yok.</p>
        </div>
      </div>
    );
  }

  // Kategorileri ve Ürünleri paralel çek
  const [categoriesRes, productsRes, reviewsRes] = await Promise.all([
    supabase.from("categories").select("*").eq("restaurant_id", restaurant.id).order("sort_order"),
    supabase.from("products").select("*, extras:product_extras(*)").eq("restaurant_id", restaurant.id).eq("is_active", true).order("sort_order"),
    restaurant.show_reviews !== false 
      ? supabase.from("reviews").select("*").eq("restaurant_id", restaurant.id).eq("status", "approved").order("created_at", { ascending: false })
      : Promise.resolve({ data: [] })
  ]);

  return (
    <MenuClient 
      initialRestaurant={restaurant}
      initialCategories={categoriesRes.data || []}
      initialProducts={productsRes.data || []}
      initialReviews={reviewsRes.data || []}
      tableNo={table || ""}
      slug={slug}
    />
  );
}
