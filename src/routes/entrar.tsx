/* =========================================================
    /entrar — página de entrada com a conta Google
    ---------------------------------------------------------
    • Quem entra ganha 7 dias de teste grátis automaticamente.
    • Depois de entrar, vai para a área de treinos.
    ========================================================= */
import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Skate do Zero" },
      {
        name: "description",
        content:
          "Entre com sua conta Google e ganhe 7 dias grátis para salvar seu cronograma de treinos de skate na nuvem.",
      },
      { property: "og:title", content: "Entrar — Skate do Zero" },
      {
        property: "og:description",
        content: "Entre com o Google e comece seus 7 dias grátis no Skate do Zero.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);

  // Se já estiver logado, manda direto para a área de treinos
  useEffect(() => {
    if (!loading && user) navigate({ to: "/treinos" });
  }, [loading, user, navigate]);

  const entrarComGoogle = async () => {
    setEnviando(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/treinos` },
    });
    if (error) {
      setEnviando(false);
      toast.error("Não deu para entrar agora. Tente de novo.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-14">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-display text-xs tracking-widest text-primary">Sua conta</p>
        <h1 className="text-display mt-2 text-4xl">Entrar no Skate do Zero</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Use sua conta Google para salvar o cronograma na nuvem e treinar de
          qualquer aparelho. Os 7 primeiros dias são grátis.
        </p>

        <Button
          onClick={entrarComGoogle}
          disabled={enviando}
          className="text-display mt-6 w-full"
        >
          {enviando ? "Abrindo..." : "Entrar com Google"}
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Quer só olhar antes?{" "}
          <Link to="/planos" className="text-primary underline">
            Ver o que está incluído
          </Link>
        </p>
      </div>
    </main>
  );
}
