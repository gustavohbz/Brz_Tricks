/* =========================================================
   SERVER FUNCTIONS — Perfil do usuário
   ---------------------------------------------------------
   • getMyProfile  → perfil do usuário logado (cria se faltar)
   • saveProfile   → salva setup / cronograma / visibilidade
   • getPublicProfile → leitura pública por share_slug
   ========================================================= */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

/* ---------- perfil do usuário logado ---------- */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data;

    const { data: created, error: insertError } = await context.supabase
      .from("profiles")
      .insert({ id: context.userId })
      .select("*")
      .single();
    if (insertError) throw insertError;
    return created;
  });

/* ---------- salvar alterações ---------- */
const saveSchema = z.object({
  display_name: z.string().max(80).nullable().optional(),
  truck: z.string().max(60).nullable().optional(),
  shape: z.string().max(60).nullable().optional(),
  wheel: z.string().max(60).nullable().optional(),
  bearing: z.string().max(60).nullable().optional(),
  is_public: z.boolean().optional(),
  plan: z.record(z.string(), z.array(z.string().max(80)).max(50)).optional(),
});

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    // remove chaves indefinidas (exactOptionalPropertyTypes)
    const patch = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined),
    ) as Record<string, never>;

    const { data: updated, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId)
      .select("*")
      .single();
    if (error) throw error;
    return updated;
  });

/* ---------- leitura pública (perfil compartilhado) ---------- */
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().max(64) }).parse(data))
  .handler(async ({ data }) => {
    const supabasePublic = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: row, error } = await supabasePublic
      .from("profiles")
      .select("display_name, avatar_url, truck, shape, wheel, bearing, plan, share_slug")
      .eq("share_slug", data.slug)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw error;
    return row;
  });
