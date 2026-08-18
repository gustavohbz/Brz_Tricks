import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { sections, type Trick } from "@/data/tricks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Skate do Zero — Ollies, Variais e Flip's" },
      {
        name: "description",
        content:
          "Comece no skate pelo caminho certo: 30 manobras explicadas passo a passo em Ollies, Variais e Flip's.",
      },
      { property: "og:title", content: "Skate do Zero — Ollies, Variais e Flip's" },
      {
        property: "og:description",
        content: "Guia iniciante de skate com 30 manobras explicadas passo a passo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [started, setStarted] = useState(false);
  const [trick, setTrick] = useState<Trick | null>(null);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {/* Welcome */}
      <section className="surface-asphalt relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,transparent_0_38px,currentColor_38px_39px)]" />
        <p className="text-display relative text-sm text-primary">Bem-vindo ao asfalto</p>
        <h1 className="text-display relative mt-4 text-6xl leading-[0.85] sm:text-8xl md:text-9xl">
          Skate
          <br />
          <span className="text-primary">do Zero</span>
        </h1>
        <p className="relative mt-6 max-w-md text-base text-muted-foreground">
          Trinta manobras, três famílias, um caminho. Escolha seu nível para liberar o guia.
        </p>

        <div className="relative mt-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={() => {
              setStarted(true);
              setTimeout(() => go("trilha"), 60);
            }}
            className="text-display ring-glow h-14 px-10 text-lg"
          >
            Sou iniciante
          </Button>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Outros níveis em breve
          </span>
        </div>

        <ChevronDown className="relative mt-16 size-6 animate-bounce text-primary" />
      </section>

      {started && (
        <>
          {/* Trilha */}
          <section id="trilha" className="border-t border-border px-6 py-24">
            <div className="mx-auto max-w-5xl">
              <p className="text-display text-sm text-accent">Trilha iniciante</p>
              <h2 className="text-display mt-2 text-4xl sm:text-5xl">Escolha por onde começar</h2>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {sections.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(s.id)}
                    className="shadow-street group rounded-lg border border-border bg-card p-6 text-left transition-all hover:-translate-y-1 hover:border-primary"
                  >
                    <span className="text-display text-5xl text-muted-foreground transition-colors group-hover:text-primary">
                      0{i + 1}
                    </span>
                    <h3 className="text-display mt-3 text-2xl">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.tagline}</p>
                    <span className="text-display mt-4 inline-block text-xs text-primary">
                      Ver 10 manobras →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Seções */}
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="border-t border-border px-6 py-24">
              <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-display text-4xl sm:text-6xl">{s.title}</h2>
                    <p className="mt-2 max-w-lg text-sm text-muted-foreground">{s.tagline}</p>
                  </div>
                  <span className="text-display rounded-full border border-border px-4 py-1 text-xs text-primary">
                    10 manobras
                  </span>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {s.tricks.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => setTrick(t)}
                      className="rounded-md border border-border bg-card px-4 py-5 text-left transition-all hover:border-primary hover:bg-secondary"
                    >
                      <span className="text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-display mt-1 block text-lg leading-tight">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ))}

          <footer className="border-t border-border px-6 py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Caia, levante, repita.
          </footer>
        </>
      )}

      <Dialog open={!!trick} onOpenChange={(o) => !o && setTrick(null)}>
        <DialogContent className="border-border bg-popover">
          {trick && (
            <>
              <DialogHeader>
                <span className="text-display text-xs text-primary">{trick.level}</span>
                <DialogTitle className="text-display text-3xl">{trick.name}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {trick.desc}
                </DialogDescription>
              </DialogHeader>
              <ol className="mt-2 space-y-2">
                {trick.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="text-display text-primary">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
