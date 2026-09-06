/* =========================================================
    subscription.functions — dados da conta no servidor
    ---------------------------------------------------------
    Todas as funções daqui rodam no servidor e exigem que a
    pessoa esteja logada (middleware requireSupabaseAuth).
    • getMyAccount  → assinatura + cronograma salvo na nuvem
    • saveMyPlan    → salva o cronograma (só para assinantes)
    ========================================================= */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Formato do cronograma: dia da semana → lista de manobras */
export type CloudPlan = Record<string, string[]>;

/** Assinatura como o site precisa ver */
export type AccountInfo = {
  status: string;
  plan: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  active: boolean; // true = pode usar o cronograma
  planData: CloudPlan;
  displayName: string | null;
  avatarUrl: string | null;
};

/** Diz se a assinatura vale agora (em teste válido ou ativa) */
function isActive(row: { status: string; trial_ends_at: string | null } | null) {
  if (!row) return false;
  if (row.status === "active") return true;
  if (row.status === "trialing" && row.trial_ends_at) {
    return new Date(row.trial_ends_at).getTime() > Date.now();
  }
  return false;
}

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountInfo> => {
    const { supabase, userId } = context;

    // Assinatura da pessoa (uma por conta)
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, plan, trial_ends_at, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    // Perfil guarda o cronograma na nuvem (coluna plan) + nome/foto
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, display_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    return {
      status: sub?.status ?? "none",
      plan: sub?.plan ?? "pro",
      trialEndsAt: sub?.trial_ends_at ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
      active: isActive(sub ?? null),
      planData: (profile?.plan as CloudPlan | null) ?? {},
      displayName: profile?.display_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
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

    // Confere a assinatura antes de deixar salvar
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!isActive(sub ?? null)) {
      throw new Error("Assinatura necessária para salvar o cronograma.");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ plan: data.plan })
      .eq("id", userId);

    if (error) throw error;
    return { ok: true };
  });
