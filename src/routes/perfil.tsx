/* =========================================================
    /perfil — página do usuário (identidade local)
    ---------------------------------------------------------
    • Nome e avatar vêm da identidade local (src/lib/local-user).
    • Setup (truck, shape, roda, rolamento) salvo no navegador.
    • Cronograma salvo no navegador (mesma chave da home, então
      o que a pessoa montar aqui aparece na home e vice-versa).
    • Nada vai para o banco: é 100% localStorage.
    ========================================================= */
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useLocalUser } from "@/lib/local-user";
import { Cronograma, STORAGE_KEY, emptyPlan, type Plan } from "@/components/Cronograma";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/perfil")({
  // Metadados da aba do navegador e de compartilhamento (SEO/social)
  head: () => ({
    meta: [
      { title: "Meu perfil — Skate do Zero" },
      {
        name: "description",
        content:
          "Guarde seu setup de skate e monte o cronograma de treinos da semana neste navegador.",
      },
      { property: "og:title", content: "Meu perfil — Skate do Zero" },
      {
        property: "og:description",
        content: "Setup do skate e cronograma de treinos, sem precisar de login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

/* Chave do localStorage onde o setup do skate fica salvo */
const SETUP_KEY = "skate-do-zero:setup";

/* Medidas do skate que o usuário anota para não esquecer */
type Setup = { truck: string; shape: string; wheel: string; bearing: string };
const emptySetup: Setup = { truck: "", shape: "", wheel: "", bearing: "" };

/* ---------- campo de texto reutilizável ----------
   Usado para nome, avatar e as quatro peças do setup.
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
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function PerfilPage() {
  // Identidade local (id + nome + avatar) com nome pronto para exibir
  const { user, update, displayName } = useLocalUser();

  // Estados do formulário — todos começam vazios e são preenchidos
  // a partir do localStorage depois que a página hidrata.
  const [setup, setSetup] = useState<Setup>(emptySetup);
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");

  /* Carrega setup e cronograma salvos no navegador.
     Roda só no cliente (useEffect), evitando erro no SSR,
     onde localStorage não existe. */
  useEffect(() => {
    try {
      const rawSetup = localStorage.getItem(SETUP_KEY);
      // Espalha sobre emptySetup para garantir todas as chaves
      if (rawSetup) setSetup({ ...emptySetup, ...JSON.parse(rawSetup) });
      const rawPlan = localStorage.getItem(STORAGE_KEY);
      // Mesma chave "cronograma-treinos" usada na home
      if (rawPlan) setPlan({ ...emptyPlan(), ...JSON.parse(rawPlan) });
    } catch {
      /* JSON corrompido: mantém os valores vazios */
    }
  }, []);

  /* Quando a identidade local carregar, copia nome/avatar para o
     formulário (o usuário edita em cima do valor atual). */
  useEffect(() => {
    if (!user) return;
    setNome(user.name);
    setAvatar(user.avatar);
  }, [user]);

  /* Botão "Salvar perfil": grava tudo de uma vez —
     setup e cronograma no localStorage, nome/avatar na identidade. */
  const salvar = () => {
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
      <h1 className="text-display mt-2 text-4xl sm:text-5xl">{displayName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tudo aqui fica guardado apenas neste navegador — sem conta, sem senha.
      </p>

      {/* ---------- SEÇÃO: IDENTIDADE (nome + avatar) ---------- */}
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="text-display text-2xl">Quem você é</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Nome"
            value={nome}
            onChange={setNome}
            placeholder="Ex.: Gustavo"
          />
          <Field
            label="Avatar (URL)"
            value={avatar}
            onChange={setAvatar}
            placeholder="https://..."
          />
        </div>
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

      {/* ---------- SEÇÃO: CRONOGRAMA (modo controlado) ----------
          O componente Cronograma não salva sozinho aqui: ele recebe
          value/onChange e o botão "Salvar perfil" persiste tudo junto. */}
      <section className="mt-10">
        <Cronograma
          value={plan}
          onChange={setPlan}
          eyebrow="Seu treino"
          title="Meu cronograma"
          description="Monte sua semana e clique em Salvar perfil para guardar."
        />
      </section>

      {/* Botão principal: salva identidade + setup + cronograma */}
      <Button className="mt-8 w-full sm:w-auto" onClick={salvar}>
        <Save className="mr-2 size-4" />
        Salvar perfil
      </Button>
    </main>
  );
}
