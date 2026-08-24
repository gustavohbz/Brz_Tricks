/* =========================================================
   CRONOGRAMA DE TREINOS
   ---------------------------------------------------------
   O usuário monta uma semana de treino escolhendo manobras
   que já existem em src/data/tricks.ts.
   Estado:
   • plan  → { "seg": ["Ollie", ...], ... } salvo em localStorage
   • day   → dia selecionado para adicionar manobras
   • query → filtro de busca da lista de manobras
   ========================================================= */
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { sections } from "@/data/tricks";
import { Button } from "@/components/ui/button";

/** Dias da semana usados como colunas do cronograma. */
const DAYS = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
] as const;

type Plan = Record<string, string[]>;

const STORAGE_KEY = "cronograma-treinos";
const emptyPlan = (): Plan => Object.fromEntries(DAYS.map((d) => [d.id, []]));

export function Cronograma() {
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [day, setDay] = useState<string>(DAYS[0].id);
  const [query, setQuery] = useState("");

  /* --- carrega o que estiver salvo no navegador (só no cliente) --- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlan({ ...emptyPlan(), ...JSON.parse(raw) });
    } catch {
      /* ignora dados corrompidos */
    }
  }, []);

  /* --- salva a cada alteração --- */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      /* storage indisponível */
    }
  }, [plan]);

  /* --- lista de manobras filtrada pela busca --- */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sections.flatMap((s) =>
      s.tricks
        .filter((t) => !q || t.name.toLowerCase().includes(q))
        .map((t) => ({ name: t.name, level: t.level, family: s.title })),
    );
  }, [query]);

  const add = (name: string) =>
    setPlan((p) =>
      p[day]?.includes(name) ? p : { ...p, [day]: [...(p[day] ?? []), name] },
    );

  const remove = (d: string, name: string) =>
    setPlan((p) => ({ ...p, [d]: (p[d] ?? []).filter((n) => n !== name) }));

  const total = Object.values(plan).reduce((acc, list) => acc + list.length, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-display text-sm text-accent">Seu treino</p>
      <h2 className="text-display mt-2 text-4xl sm:text-5xl">Cronograma de treinos</h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Escolha um dia, adicione as manobras que quer treinar e monte sua semana. Tudo fica
        salvo neste navegador.
      </p>

      {/* --- seletor de dia --- */}
      <div className="mt-8 flex flex-wrap gap-2">
        {DAYS.map((d) => (
          <button
            key={d.id}
            onClick={() => setDay(d.id)}
            className={`text-display rounded-full border px-4 py-1.5 text-sm transition-colors ${
              day === d.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary"
            }`}
          >
            {d.label}
            {(plan[d.id]?.length ?? 0) > 0 && (
              <span className="ml-2 text-xs opacity-70">{plan[d.id].length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* --- coluna 1: catálogo de manobras --- */}
        <div className="rounded-lg border border-border bg-card p-5">
          <label htmlFor="busca-manobra" className="text-display text-xs text-primary">
            Adicionar manobra
          </label>
          <input
            id="busca-manobra"
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 60))}
            placeholder="Buscar manobra..."
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />

          <ul className="mt-4 max-h-80 space-y-1 overflow-y-auto pr-1">
            {results.map((t) => {
              const added = plan[day]?.includes(t.name);
              return (
                <li key={t.name}>
                  <button
                    onClick={() => add(t.name)}
                    disabled={added}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-border hover:bg-secondary disabled:opacity-40"
                  >
                    <span>
                      <span className="text-sm">{t.name}</span>
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {t.family}
                      </span>
                    </span>
                    <Plus className="size-4 shrink-0 text-primary" />
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Nenhuma manobra encontrada.
              </li>
            )}
          </ul>
        </div>

        {/* --- coluna 2: a semana montada --- */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-display text-xs text-primary">Sua semana</span>
            <span className="text-xs text-muted-foreground">{total} manobras</span>
          </div>

          <div className="mt-4 space-y-4">
            {DAYS.map((d) => (
              <div key={d.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-display text-lg">{d.label}</p>
                {(plan[d.id]?.length ?? 0) === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">Descanso</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {plan[d.id].map((name) => (
                      <li
                        key={name}
                        className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs"
                      >
                        {name}
                        <button
                          onClick={() => remove(d.id, name)}
                          aria-label={`Remover ${name} de ${d.label}`}
                          className="text-muted-foreground transition-colors hover:text-primary"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={() => setPlan(emptyPlan())}
            disabled={total === 0}
          >
            <Trash2 className="mr-2 size-4" />
            Limpar cronograma
          </Button>
        </div>
      </div>
    </div>
  );
}
