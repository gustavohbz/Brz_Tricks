/* =========================================================
    /treinos — área de quem tem conta (cronograma na nuvem)
    ---------------------------------------------------------
    • Sem conta   → convite para entrar com o Google.
    • Teste/ativo → cronograma salvo na nuvem (salva automático).
    • Teste vencido → aviso e link para os planos.
    ========================================================= */
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { getMyAccount, saveMyPlan, type CloudPlan } from "@/lib/subscription.functions";
import { Cronograma, emptyPlan, type Plan } from "@/components/Cronograma";
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

/** Mostra em texto simples até quando vai o teste grátis */
function diasRestantes(fim: string | null) {
  if (!fim) return null;
  const ms = new Date(fim).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86_400_000);
}

function TreinosPage() {
  const { user, loading } = useAuth();
  const buscarConta = useServerFn(getMyAccount);
  const salvarPlano = useServerFn(saveMyPlan);

  // Dados da conta (assinatura + cronograma da nuvem)
  const conta = useQuery({
    queryKey: ["minha-conta", user?.id],
    queryFn: () => buscarConta(),
    enabled: !!user,
  });

  // Cópia local do cronograma para editar sem travar a tela
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    if (conta.data && plan === null) {
      setPlan({ ...emptyPlan(), ...(conta.data.planData as Plan) });
    }
  }, [conta.data, plan]);

  const gravar = useMutation({
    mutationFn: (p: CloudPlan) => salvarPlano({ data: { plan: p } }),
    onError: () => toast.error("Não deu para salvar agora."),
  });

  // Salva pouco depois de a pessoa parar de mexer (evita salvar a cada clique)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alterar = (novo: Plan) => {
    setPlan(novo);
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

  /* ---------- sem conta ---------- */
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-14">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-display text-4xl">Área de treinos</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Entre com sua conta Google para montar seu cronograma e deixar tudo
            salvo na nuvem. Os 7 primeiros dias são grátis.
          </p>
          <Button asChild className="text-display mt-6 w-full">
            <Link to="/entrar">Entrar com Google</Link>
          </Button>
        </div>
      </main>
    );
  }

  /* ---------- teste vencido ---------- */
  if (conta.data && !conta.data.active) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 pt-14">
        <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-display text-4xl">Seu teste terminou</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu cronograma continua guardado. Assim que a assinatura estiver
            disponível, você volta a editar por aqui.
          </p>
          <Button asChild variant="secondary" className="text-display mt-6 w-full">
            <Link to="/planos">Ver planos</Link>
          </Button>
        </div>
      </main>
    );
  }

  const dias = diasRestantes(conta.data?.trialEndsAt ?? null);

  /* ---------- assinatura válida ---------- */
  return (
    <main className="min-h-screen px-2 pt-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-card px-4 py-3">
          <p className="text-sm">
            {conta.data?.status === "trialing" && dias !== null
              ? `Teste grátis — ${dias} ${dias === 1 ? "dia" : "dias"} restantes.`
              : "Assinatura ativa."}
          </p>
          <span className="text-xs text-muted-foreground">
            {gravar.isPending ? "Salvando..." : "Salvo na nuvem"}
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
