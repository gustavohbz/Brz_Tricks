/* =========================================================
    /treinos — área de quem tem conta (cronograma na nuvem)
    ---------------------------------------------------------
    • Sem conta → convite para entrar com o Google.
    • Com conta → cronograma salvo na nuvem (salva automático).
    ========================================================= */
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { getMyAccount, saveMyPlan, type CloudPlan } from "@/lib/account.functions";
import { Cronograma, emptyPlan, STORAGE_KEY, type Plan } from "@/components/Cronograma";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/treinos")({
  head: () => ({
    meta: [
      { title: "Meus treinos — Skate do Zero" },
      {
        name: "description",
        content:
          "Monte seu cronograma semanal de treinos de skate e deixe salvo na nuvem para treinar de qualquer aparelho.",
      },
      { property: "og:title", content: "Meus treinos — Skate do Zero" },
      {
        property: "og:description",
        content: "Seu cronograma de treinos de skate salvo na nuvem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TreinosPage,
});

function TreinosPage() {
  const { user, loading } = useAuth();
  const buscarConta = useServerFn(getMyAccount);
  const salvarPlano = useServerFn(saveMyPlan);

  // Dados da conta (cronograma salvo na nuvem)
  const conta = useQuery({
    queryKey: ["minha-conta", user?.id],
    queryFn: () => buscarConta(),
    enabled: !!user,
  });

  // Cache do navegador primeiro; a nuvem é cópia de segurança.
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    if (!conta.data || plan !== null) return;
    let cache: Plan | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) cache = JSON.parse(raw) as Plan;
    } catch {
      cache = null;
    }
    const temCache = cache && Object.values(cache).some((l) => l?.length);
    setPlan({ ...emptyPlan(), ...((temCache ? cache : conta.data.planData) as Plan) });
  }, [conta.data, plan]);

  const gravar = useMutation({
    mutationFn: (p: CloudPlan) => salvarPlano({ data: { plan: p } }),
    onError: () => toast.error("Salvo no navegador; a nuvem sincroniza depois."),
  });

  // Salva no navegador na hora e na nuvem pouco depois
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alterar = (novo: Plan) => {
    setPlan(novo);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novo));
    } catch {
      /* navegador bloqueou o armazenamento */
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => gravar.mutate(novo), 800);
  };

  /* ---------- carregando ---------- */
  if (loading || (user && conta.isLoading)) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-14">
        <p className="text-sm text-muted-foreground">Carregando seus treinos...</p>
      </main>
    );
  }

  /* ---------- sem conta: salva só no navegador ---------- */
  if (!user) {
    return (
      <main className="min-h-screen px-2 pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-sm">
              Salvo neste navegador. Entre com Google para ter cópia na nuvem.
            </p>
            <Button asChild size="sm" className="text-display">
              <Link to="/entrar">Entrar com Google</Link>
            </Button>
          </div>
        </div>
        <Cronograma
          title="Meus treinos"
          eyebrow="Neste aparelho"
          description="Escolha um dia e adicione as manobras — fica salvo neste navegador."
        />
      </main>
    );
  }

  /* ---------- com conta ---------- */
  return (
    <main className="min-h-screen px-2 pt-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-card px-4 py-3">
          <p className="text-sm">Cronograma salvo na nuvem — dá para abrir de qualquer aparelho.</p>
          <span className="text-xs text-muted-foreground">
            {gravar.isPending ? "Salvando..." : "Tudo salvo"}
          </span>
        </div>
      </div>

      <Cronograma
        value={plan ?? emptyPlan()}
        onChange={alterar}
        title="Meus treinos"
        eyebrow="Sua conta"
        description="Escolha um dia, adicione as manobras e o cronograma fica salvo na sua conta — dá para abrir de qualquer aparelho."
      />
    </main>
  );
}
