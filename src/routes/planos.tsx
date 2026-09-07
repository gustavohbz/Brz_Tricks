/* =========================================================
    /planos — o que está incluído e o teste grátis de 7 dias
    ---------------------------------------------------------
    Por enquanto a cobrança está desligada: quem cria conta
    ganha 7 dias grátis e usa tudo nesse período.
    ========================================================= */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Skate do Zero" },
      {
        name: "description",
        content:
          "7 dias grátis para montar e salvar seu cronograma de treinos de skate na nuvem, com guia de manobras e mapa de pistas.",
      },
      { property: "og:title", content: "Planos — Skate do Zero" },
      {
        property: "og:description",
        content: "Comece com 7 dias grátis no Skate do Zero. Sem cartão.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanosPage,
});

/** Lista do que a pessoa recebe no período de teste */
const BENEFICIOS = [
  "Cronograma de treinos salvo na nuvem",
  "Acesso em qualquer aparelho com a mesma conta",
  "Guia completo com 30 manobras e vídeos",
  "Mapa das pistas com notas e comentários",
];

function PlanosPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen px-6 pb-24 pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-display text-xs tracking-widest text-primary">Planos</p>
        <h1 className="text-display mt-2 text-5xl">Comece com 7 dias grátis</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Crie sua conta e use tudo por uma semana, sem cartão. A cobrança ainda
          não está ativa — quando estiver, você é avisado antes.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-md rounded-xl border border-primary/40 bg-card p-8 shadow-[var(--shadow-glow)]">
        <p className="text-display text-xs tracking-widest text-primary">Skater</p>
        <p className="text-display mt-1 text-5xl">
          Grátis <span className="text-lg text-muted-foreground">/ 7 dias</span>
        </p>

        <ul className="mt-6 space-y-3">
          {BENEFICIOS.map((b) => (
            <li key={b} className="flex gap-3 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <Button asChild className="text-display mt-8 w-full">
          {user ? (
            <Link to="/treinos">Ir para meus treinos</Link>
          ) : (
            <Link to="/entrar">Criar conta com Google</Link>
          )}
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Depois do teste, o cronograma na nuvem pausa — nada é apagado.
        </p>
      </div>
    </main>
  );
}
