import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Tables } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { productInputSchema } from "./products";

export type Product = Tables<"products"> & { photoUrls: string[] };
async function withPhotos(client: SupabaseClient<Database>, rows: Tables<"products">[]): Promise<Product[]> {
  return Promise.all(rows.map(async row => {
    const { data, error } = await client.storage.from("product-photos").createSignedUrls(row.photos, 3600);
    if (error) throw new Error("Não foi possível carregar as fotos.");
    const photoUrls = data.map(p => p.signedUrl);
    if (photoUrls.some(url => !url)) throw new Error("Não foi possível carregar as fotos.");
    return { ...row, photoUrls: photoUrls.filter((url): url is string => typeof url === "string") };
  }));
}
export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"]; const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Marketplace indisponível.");
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h });
  } } });
  const { data, error } = await client.from("products").select("*").is("deleted_at", null).order("created_at", { ascending: false }).limit(200);
  if (error) throw new Error("Não foi possível carregar os anúncios.");
  return withPhotos(client, data);
});
export const marketplaceAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw new Error("Não foi possível verificar as permissões."); return { admin: data };
});
export const deletedProducts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Acesso restrito ao administrador.");
  const { data, error } = await context.supabase.from("products").select("*").not("deleted_at", "is", null).order("deleted_at", { ascending: false }).limit(200);
  if (error) throw new Error("Não foi possível carregar os excluídos."); return withPhotos(context.supabase, data);
});
export const saveProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.object({ product: productInputSchema, editing: z.boolean() }).strict().parse(v)).handler(async ({ data, context }) => {
  const { id, price, ...fields } = data.product;
  const values = { ...fields, price_cents: price };
  const result = data.editing
    ? await context.supabase.from("products").update(values).eq("id", id).eq("user_id", context.userId).is("deleted_at", null).select("id").single()
    : await context.supabase.from("products").insert({ ...values, id, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("Não foi possível salvar. Confira os campos e as fotos."); return { id };
});
export const removeProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.object({ id: z.string().uuid(), permanent: z.boolean() }).strict().parse(v)).handler(async ({ data, context }) => {
  if (!data.permanent) {
    const { error } = await context.supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", data.id).eq("user_id", context.userId).is("deleted_at", null).select("id").single();
    if (error) throw new Error("Não foi possível excluir este anúncio."); return { ok: true };
  }
  const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!admin) throw new Error("Acesso restrito ao administrador.");
  const { data: product, error: readError } = await context.supabase.from("products").select("photos").eq("id", data.id).not("deleted_at", "is", null).single();
  if (readError) throw new Error("Anúncio não encontrado.");
  const { error } = await context.supabase.from("products").delete().eq("id", data.id).not("deleted_at", "is", null).select("id").single();
  if (error) throw new Error("Não foi possível excluir definitivamente.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: storageError } = await supabaseAdmin.storage.from("product-photos").remove(product.photos);
  if (storageError) throw new Error("Anúncio excluído; a limpeza das fotos não foi concluída.");
  return { ok: true };
});