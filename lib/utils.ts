import { Product } from "@/types";
import { LangKey } from "./constants";

export function getProductName(p: Product, lang: LangKey): string {
  return (p as any)[`name_${lang}`] || p.name_tr || p.name_en || "";
}

export function getProductDesc(p: Product, lang: LangKey): string {
  return (p as any)[`desc_${lang}`] || p.desc_tr || p.desc_en || "";
}

export function getTranslatedName(obj: any, lang: LangKey): string {
  if (!obj) return "";
  return obj[`name_${lang}`] || obj.name_tr || obj.name || "";
}
