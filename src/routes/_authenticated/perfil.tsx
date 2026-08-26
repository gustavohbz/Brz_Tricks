/* =========================================================
   /perfil — página do usuário logado
   ---------------------------------------------------------
   • Setup (truck, shape, roda, rolamento)
   • Cronograma salvo na conta (migra o do navegador)
   • Compartilhamento por link + toggle público/privado
   ========================================================= */
import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Loader2, Save } from "lucide-react";
import { getMyProfile, saveProfile } from "@/lib/profile.functions";
import { Cronograma, STORAGE_KEY, emptyPlan, type Plan } from "@/components/Cronograma";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — Skate do Zero" },
      {
        name: "description",
        content:
          "Guarde seu setup de skate e monte o cronograma de treinos da semana na sua conta.",
      },
      { property: "og:title", content: "Meu perfil — Skate do Zero" },
      {
        property: "og:description",
        content: "Setup, cronograma de treinos e link de compartilhamento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

/* ---------- campo de texto reutilizável ---------- */
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
        onChange={(e) => onChange(e.target.value.slice(0, 60))}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function PerfilPage() {
  const fetchProfile = useServerFn(getMyProfile);
  const persist = useServerFn(saveProfile);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  /* ---------- formulário local ---------- */
  const [setup, setSetup] = useState({ truck: "", shape: "", wheel: "", bearing: "" });
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setSetup({
      truck: profile.truck ?? "",
      shape: profile.shape ?? "",
      wheel: profile.wheel ?? "",
      bearing: profile.bearing ?? "",
    });
    setIsPublic(profile.is_public);

    const saved = (profile.plan ?? {}) as Plan;
    const hasSaved = Object.values(saved).some((l) => Array.isArray(l) && l.length > 0);
    if (hasSaved) {
      setPlan({ ...emptyPlan(), ...saved });
      return;
    }
    // migra o cronograma que estava salvo só no navegador
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan({ ...emptyPlan(), ...JSON.parse(raw) });
    } catch {
      /* ignora */
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      persist({
        data: {
          truck: setup.truck || null,
          shape: setup.shape || null,
          wheel: setup.wheel || null,
          bearing: setup.bearing || null,
          is_public: isPublic,
          plan,
        },
      }),
    onSuccess: () => {
      toast.success("Perfil salvo!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => toast.error("Não foi possível salvar. Tente novamente."),
  });

  const shareUrl = useMemo(
    () =>
      profile && typeof window !== "undefined"
        ? `${window.location.origin}/p/${profile.share_slug}`
        : "",
    [profile],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-24">
      <p className="text-display text-sm text-accent">Sua conta</p>
      <h1 className="text-display mt-2 text-4xl sm:text-5xl">
        {profile?.display_name ?? "Meu perfil"}
      </h1>

      {/* ---------- SETUP ---------- */}
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="text-display text-2xl">Setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anote as medidas do seu skate para não esquecer na hora de repor peças.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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

      {/* ---------- CRONOGRAMA DA CONTA ---------- */}
      <section className="mt-10">
        <Cronograma
          value={plan}
          onChange={setPlan}
          eyebrow="Seu treino"
          title="Meu cronograma"
          description="Monte sua semana. Clique em Salvar para guardar na sua conta."
        />
      </section>

      {/* ---------- COMPARTILHAMENTO ---------- */}
      <section className="mt-10 rounded-lg border border-border bg-card p-5">
        <h2 className="text-display text-2xl">Compartilhar</h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm">Perfil público</p>
            <p className="text-xs text-muted-foreground">
              Quando ativo, qualquer pessoa com o link vê seu setup e cronograma.
            </p>
          </div>
          <Switch checked={isPublic} onCheckedChange={setIsPublic} />
        </div>

        {shareUrl && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={shareUrl}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast.success("Link copiado!");
              }}
            >
              <Copy className="mr-2 size-4" />
              Copiar link
            </Button>
          </div>
        )}
      </section>

      <Button
        className="mt-8 w-full sm:w-auto"
        onClick={() => save.mutate()}
        disabled={save.isPending}
      >
        {save.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Save className="mr-2 size-4" />
        )}
        Salvar perfil
      </Button>
    </main>
  );
}
