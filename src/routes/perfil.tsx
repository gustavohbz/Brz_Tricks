/* =========================================================
    /perfil — página do usuário
    ---------------------------------------------------------
    • Com conta (Google): setup e cronograma ficam na conta,
      então abrem de qualquer aparelho. Nome e foto vêm do Google.
    • Sem conta: tudo guardado apenas neste navegador
      (identidade local + localStorage), do jeito de antes.
    • Ao entrar com a conta, o que estava só neste navegador é
      aproveitado se a ficha na nuvem ainda estiver vazia.
    ========================================================= */
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useLocalUser } from "@/lib/local-user";
import {
  getMyAccount,
  saveMyPlan,
  saveMySetup,
  type CloudPlan,
} from "@/lib/account.functions";
import { emptySetup, sanitizeSetup, SETUP_KEY, type Setup } from "@/lib/setup";
import { Cronograma, STORAGE_KEY, emptyPlan, type Plan } from "@/components/Cronograma";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  // Metadados da aba do navegador e de compartilhamento (SEO/social)
  head: () => ({
    meta: [
      { title: "Meu perfil — Brauza Skate Co." },
      {
        name: "description",
        content:
          "Guarde seu setup de skate e monte o cronograma de treinos da semana — na sua conta, para abrir de qualquer aparelho.",
      },
      { property: "og:title", content: "Meu perfil — Brauza Skate Co." },
      {
        property: "og:description",
        content: "Setup do skate e cronograma de treinos salvos na sua conta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

/* ---------- campo de texto reutilizável ----------
   Usado para nome e avatar quando a pessoa não tem conta.
   Recebe o valor atual e avisa o pai a cada tecla digitada. */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-display text-xs text-primary">{label}</span>
      <input
        value={value}
        // Limita cada campo a 60 caracteres
        onChange={(e) => onChange(e.target.value.slice(0, 60))}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary sm:text-sm"
      />
    </label>
  );
}

/* A ficha tem alguma peça anotada? (Serve para decidir se
   aproveita o que estava só neste navegador ao entrar na conta) */
function fichaPreenchida(s: Setup) {
  return Object.values(s).some((v) => v.trim() !== "");
}

/* O cronograma tem alguma manobra marcada? */
function cronogramaPreenchido(p: Record<string, string[]>) {
  return Object.values(p).some((lista) => Array.isArray(lista) && lista.length > 0);
}

function PerfilPage() {
  // Conta com Google (nome e foto) e identidade local (visitantes)
  const { user, loading, displayName, avatarUrl } = useAuth();
  const { user: localUser, update, displayName: nomeLocal } = useLocalUser();

  const buscarConta = useServerFn(getMyAccount);
  const gravarSetup = useServerFn(saveMySetup);
  const gravarPlano = useServerFn(saveMyPlan);

  // Dados da conta: setup + cronograma salvos na nuvem
  const conta = useQuery({
    queryKey: ["minha-conta", user?.id],
    queryFn: () => buscarConta(),
    enabled: !!user,
  });

  // Estados do formulário — preenchidos uma única vez, depois
  // ficam livres para a pessoa editar sem serem sobrescritos.
  const [setup, setSetup] = useState<Setup>(emptySetup);
  const [plan, setPlan] = useState<Plan>(emptyPlan());
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");
  const preenchido = useRef(false);

  /* Lê o que estava guardado neste navegador.
     Roda só no cliente (useEffect): no SSR não existe localStorage. */
  useEffect(() => {
    if (preenchido.current) return;

    let localSetup = emptySetup;
    let localPlan = emptyPlan();
    try {
      const rawSetup = localStorage.getItem(SETUP_KEY);
      if (rawSetup) localSetup = sanitizeSetup(JSON.parse(rawSetup));
      const rawPlan = localStorage.getItem(STORAGE_KEY);
      if (rawPlan) localPlan = { ...emptyPlan(), ...JSON.parse(rawPlan) };
    } catch {
      /* JSON corrompido: mantém os valores vazios */
    }

    if (user && conta.data) {
      // A conta manda; o que estava só neste navegador entra se a
      // ficha na nuvem ainda estiver vazia (nada se perde ao entrar).
      setSetup(fichaPreenchida(conta.data.setup) ? conta.data.setup : localSetup);
      setPlan(
        cronogramaPreenchido(conta.data.planData)
          ? { ...emptyPlan(), ...(conta.data.planData as Plan) }
          : localPlan,
      );
      preenchido.current = true;
    } else if (!user && !loading) {
      // Visitante: trabalha em cima do que já está neste navegador.
      setSetup(localSetup);
      setPlan(localPlan);
      setNome(localUser?.name ?? "");
      setAvatar(localUser?.avatar ?? "");
      preenchido.current = true;
    }
  }, [user, loading, conta.data, localUser]);

  /* Botão "Salvar perfil".
     Com conta → grava na conta (e guarda uma cópia neste navegador).
     Sem conta → grava tudo neste navegador, como antes. */
  const salvar = async () => {
    if (user) {
      try {
        await gravarSetup({ data: { setup } });
        await gravarPlano({ data: { plan: plan as CloudPlan } });
        try {
          localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
        } catch {
          /* cópia local é só segurança; a conta já guardou */
        }
        toast.success("Perfil salvo na sua conta!");
      } catch {
        toast.error("Não deu para salvar agora. Tente de novo.");
      }
      return;
    }

    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(setup));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // localStorage cheio ou bloqueado (modo anônimo, por exemplo)
      toast.error("Não foi possível salvar neste navegador.");
      return;
    }
    update({ name: nome.trim(), avatar: avatar.trim() });
    toast.success("Perfil salvo!");
  };

  // Enquanto a sessão não aparece, não mostra formulário pela metade
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center pt-14">
        <p className="text-sm text-muted-foreground">Carregando seu perfil...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-24">
      {/* Voltar para a home */}
      <Link to="/">
        <Button variant="ghost" className="mb-2 -ml-2 gap-1 px-2 text-sm">
          <ArrowLeft className="size-4" />
          Voltar para home
        </Button>
      </Link>

      {/* Cabeçalho da página com o nome de exibição */}
      <p className="text-display text-sm text-accent">Seu perfil</p>
      <h1 className="text-display mt-2 text-4xl sm:text-5xl">
        {user ? displayName : nomeLocal}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {user
          ? "Salvo na sua conta — você abre de qualquer aparelho."
          : "Tudo aqui fica guardado apenas neste navegador — sem conta, sem senha."}
      </p>

      {/* ---------- SEÇÃO: IDENTIDADE ---------- */}
      <section className="mt-10 rounded-lg border border-border bg-card p-4 sm:p-5">
        <h2 className="text-display text-2xl">Quem você é</h2>
        {user ? (
          <div className="mt-4 flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="size-12 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="text-display flex size-12 items-center justify-center rounded-full border border-border text-lg">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                Nome e foto vêm da sua conta Google.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Nome" value={nome} onChange={setNome} placeholder="Ex.: Gustavo" />
            <Field
              label="Avatar (URL)"
              value={avatar}
              onChange={setAvatar}
              placeholder="https://..."
            />
          </div>
        )}
      </section>

      {/* ---------- SEÇÃO: SETUP (medidas do skate) ---------- */}
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="text-display text-2xl">Setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anote as medidas do seu skate para não esquecer na hora de repor peças.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Cada campo atualiza apenas a sua chave dentro do objeto setup */}
          <Field
            label="Truck"
            value={setup.truck}
            onChange={(v) => setSetup((s) => ({ ...s, truck: v }))}
            placeholder="Ex.: 139mm"
          />
          <Field
            label="Shape"
            value={setup.shape}
            onChange={(v) => setSetup((s) => ({ ...s, shape: v }))}
            placeholder='Ex.: 8.0"'
          />
          <Field
            label="Roda"
            value={setup.wheel}
            onChange={(v) => setSetup((s) => ({ ...s, wheel: v }))}
            placeholder="Ex.: 53mm 99A"
          />
          <Field
            label="Rolamento"
            value={setup.bearing}
            onChange={(v) => setSetup((s) => ({ ...s, bearing: v }))}
            placeholder="Ex.: Abec 7"
          />
        </div>
      </section>

      {/* ---------- SEÇÃO: CRONOGRAMA ----------
          Editável e salvo na nuvem (com conta) ou neste navegador. */}
      <section className="mt-10">
        <Cronograma
          value={plan}
          onChange={setPlan}
          eyebrow="Seu treino"
          title="Meu cronograma"
          description={
            user
              ? "Monte sua semana e clique em Salvar perfil para guardar na sua conta."
              : "Monte sua semana e clique em Salvar perfil para guardar neste navegador."
          }
        />
      </section>

      {/* Botão principal: salva identidade + setup + cronograma */}
      <Button className="mt-8 w-full sm:w-auto" onClick={salvar} disabled={!!user && conta.isLoading}>
        <Save className="mr-2 size-4" />
        Salvar perfil
      </Button>
    </main>
  );
}
