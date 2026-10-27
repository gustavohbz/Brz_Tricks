/* =========================================================
    /entrar — página de entrada com a conta Google
    ---------------------------------------------------------
    • Depois de entrar, o cronograma fica salvo na nuvem e
      a pessoa vai direto para a área de treinos.
    ========================================================= */
import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Brauza Skate Co." },
      {
        name: "description",
        content:
          "Entre com sua conta Google para salvar seu cronograma de treinos de skate na nuvem.",
      },
      { property: "og:title", content: "Entrar — Brauza Skate Co." },
      {
        property: "og:description",
        content: "Entre com o Google e salve seu cronograma na Brauza Skate Co.",
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
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/entrar`,
      });
      if (result.error) {
        toast.error("Não deu para entrar agora. Tente de novo.");
        return;
      }
      if (result.redirected) return;
      // useAuth confirms the session before the effect navigates to /treinos.
    } catch {
      toast.error("Não deu para entrar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 pt-14">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-display text-xs tracking-widest text-primary">Sua conta</p>
        <h1 className="text-display mt-2 text-4xl">Entrar na Brauza Skate Co.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Use sua conta Google para salvar o cronograma na nuvem e treinar de
          qualquer aparelho.
        </p>

        <Button
          onClick={entrarComGoogle}
          disabled={enviando}
          className="text-display mt-6 w-full"
        >
          {enviando ? "Abrindo..." : "Entrar com Google"}
        </Button>
      </div>
    </main>
  );
}
