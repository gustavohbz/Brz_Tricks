/* =========================================================
   /p/$slug — perfil público compartilhado (somente leitura)
   ========================================================= */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getPublicProfile } from "@/lib/profile.functions";
import { Button } from "@/components/ui/button";

const DAYS = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
] as const;

const profileQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-profile", slug],
    queryFn: () => getPublicProfile({ data: { slug } }),
  });

export const Route = createFileRoute("/p/$slug")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(profileQuery(params.slug)),
  head: () => ({
    meta: [
      { title: "Cronograma de treinos compartilhado — Skate do Zero" },
      {
        name: "description",
        content: "Veja o setup e o cronograma semanal de treinos deste skatista.",
      },
      { property: "og:title", content: "Cronograma compartilhado — Skate do Zero" },
      {
        property: "og:description",
        content: "Setup e treinos da semana montados na wiki de manobras.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <Aviso texto="Não foi possível carregar este perfil." />,
  notFoundComponent: () => <Aviso texto="Perfil não encontrado." />,
  component: PublicProfilePage,
});

function Aviso({ texto }: { texto: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 text-center">
      <h1 className="text-display text-3xl">{texto}</h1>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/">Voltar para a wiki</Link>
      </Button>
    </main>
  );
}

function PublicProfilePage() {
  const { slug } = Route.useParams();
  const { data: profile } = useSuspenseQuery(profileQuery(slug));

  if (!profile) return <Aviso texto="Este perfil é privado ou não existe." />;

  const plan = (profile.plan ?? {}) as Record<string, string[]>;
  const setup = [
    { label: "Truck", value: profile.truck },
    { label: "Shape", value: profile.shape },
    { label: "Roda", value: profile.wheel },
    { label: "Rolamento", value: profile.bearing },
  ].filter((s) => s.value);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-24">
      <p className="text-display text-sm text-accent">Perfil compartilhado</p>
      <h1 className="text-display mt-2 text-4xl sm:text-5xl">
        {profile.display_name ?? "Skatista"}
      </h1>

      {setup.length > 0 && (
        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="text-display text-2xl">Setup</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-4">
            {setup.map((s) => (
              <div key={s.label}>
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="text-sm">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="text-display text-2xl">Cronograma da semana</h2>
        <div className="mt-4 space-y-4">
          {DAYS.map((d) => (
            <div key={d.id} className="border-b border-border pb-3 last:border-0">
              <p className="text-display text-lg">{d.label}</p>
              {(plan[d.id]?.length ?? 0) === 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">Descanso</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {(plan[d.id] ?? []).map((name) => (
                    <li
                      key={name}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <Button asChild className="mt-8">
        <Link to="/">Montar o meu cronograma</Link>
      </Button>
    </main>
  );
}
