/* =========================================================
    account.functions — dados da conta no servidor
    ---------------------------------------------------------
    Todas as funções daqui rodam no servidor e exigem que a
    pessoa esteja logada (middleware requireSupabaseAuth).
    • getMyAccount  → cronograma, setup, nome e foto da conta
    • saveMyPlan    → salva o cronograma
    • saveMySetup   → salva as medidas do skate
    ========================================================= */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sanitizeSetup, type Setup } from "@/lib/setup";

/** Formato do cronograma: dia da semana → lista de manobras */
export type CloudPlan = Record<string, string[]>;

/** Dados da conta como o site precisa ver */
export type AccountInfo = {
  planData: CloudPlan;
  displayName: string | null;
  avatarUrl: string | null;
  setup: Setup;
};

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountInfo> => {
    const { supabase, userId } = context;

    // Perfil guarda o cronograma na nuvem (coluna plan) + nome/foto/setup
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, display_name, avatar_url, truck, shape, wheel, bearing")
      .eq("id", userId)
      .maybeSingle();

    return {
      planData: (profile?.plan as CloudPlan | null) ?? {},
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      setup: sanitizeSetup({
        truck: profile?.truck,
        shape: profile?.shape,
        wheel: profile?.wheel,
        bearing: profile?.bearing,
      }),
    };
  });

export const saveMyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { plan: CloudPlan }) => {
    // Limpa a entrada: no máximo 7 dias, 30 manobras por dia
    const limpo: CloudPlan = {};
    for (const [dia, manobras] of Object.entries(input.plan ?? {}).slice(0, 7)) {
      if (!Array.isArray(manobras)) continue;
      limpo[dia.slice(0, 10)] = manobras
        .filter((m): m is string => typeof m === "string")
        .slice(0, 30)
        .map((m) => m.slice(0, 80));
    }
    return { plan: limpo };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({ plan: data.plan })
      .eq("id", userId);

    if (error) throw error;
    return { ok: true };
  });

/**
 * Salva as medidas do skate na conta da própria pessoa.
 * As regras de acesso só deixam cada pessoa mexer na própria ficha.
 */
export const saveMySetup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { setup?: unknown }) => ({ setup: sanitizeSetup(input?.setup) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          truck: data.setup.truck,
          shape: data.setup.shape,
          wheel: data.setup.wheel,
          bearing: data.setup.bearing,
        },
        { onConflict: "id" },
      );

    if (error) throw error;
    return { ok: true };
  });
