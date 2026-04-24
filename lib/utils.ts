import { Product } from "@/types";
import { LangKey } from "./constants";

export function getProductName(p: Product, lang: LangKey): string {
  return (p as any)[`name_${lang}`] || p.name_tr;
}

export function getProductDesc(p: Product, lang: LangKey): string {
  return (p as any)[`desc_${lang}`] || p.desc_tr || "";
}
