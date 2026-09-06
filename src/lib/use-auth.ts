/* =========================================================
    use-auth — quem está logado agora (conta com Google)
    ---------------------------------------------------------
    • Lê a sessão do usuário no navegador e fica escutando
      mudanças (entrou, saiu, token renovado).
    • Devolve o usuário, um "carregando" e a função de sair.
    ========================================================= */
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    // Sessão atual (primeira leitura ao montar no navegador)
    supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Atualiza quando o usuário entra ou sai
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Nome e foto vindos do Google (com fallback para o e-mail)
  const displayName =
    (user?.user_metadata?.["full_name"] as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "Skater";
  const avatarUrl = (user?.user_metadata?.["avatar_url"] as string | undefined) ?? "";

  return { user, loading, signOut, displayName, avatarUrl };
}
