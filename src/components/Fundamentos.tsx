import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

const fundamentals = [
  {
    title: "Base & stance",
    focus: "Equilíbrio",
    description:
      "Regular e goofy são apenas nomes para a posição dos pés. Regular costuma deixar o pé esquerdo à frente; goofy, o direito. A melhor base é a que faz você se sentir mais estável.",
    steps: [
      "Peça um empurrãozinho leve a alguém de confiança e observe qual pé vai à frente para recuperar o equilíbrio.",
      "Outra pista é perceber qual pé você coloca primeiro ao subir um degrau.",
      "Com a base escolhida, apoie o pé da frente perto dos parafusos, levemente inclinado, e o pé de trás sobre o tail.",
    ],
  },
  {
    title: "Postura & equilíbrio",
    focus: "Postura",
    description:
      "Uma postura relaxada ajuda você a acompanhar o skate e absorver pequenos movimentos sem ficar rígido.",
    steps: [
      "Mantenha os joelhos semiflexionados e o peso centralizado sobre a prancha.",
      "Apoie os pés sobre os parafusos e deixe espaço entre eles para equilibrar.",
      "Mantenha os ombros alinhados com o skate e olhe para onde quer seguir.",
    ],
  },
  {
    title: "Remada correta",
    focus: "Movimento",
    description:
      "Comece em uma área plana, livre e com pouco movimento. Embale aos poucos antes de tentar ganhar velocidade.",
    steps: [
      "Deixe o pé da frente próximo aos parafusos dianteiros, apontando para o nose.",
      "Use o pé de trás para impulsionar o chão sem girar os ombros nem perder o equilíbrio.",
      "Quando estiver rolando, volte o pé de trás para o tail e gire o pé da frente para a posição de passeio.",
    ],
  },
  {
    title: "Curvas & frenagem básica",
    focus: "Segurança",
    description:
      "Aprenda a mudar de direção e reduzir a velocidade primeiro em baixa velocidade e em terreno plano.",
    steps: [
      "Incline o peso suavemente para os calcanhares ou para as pontas dos pés para iniciar uma curva.",
      "Pratique pequenos tic-tacs no plano para ajustar a direção sem acelerar.",
      "Para frear, apoie o pé de trás no chão aos poucos e arraste a sola com controle; não pule do skate.",
      "Use capacete e proteções. Deixe descidas para quando já conseguir controlar curvas e frenagem.",
    ],
  },
] as const;

export function Fundamentos() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="fundamentos"
      aria-labelledby="fundamentos-title"
      className="scroll-mt-14 border-t border-border px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <h2 id="fundamentos-title" className="sr-only">Fundamentos</h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="fundamentos-content"
          aria-label={`${expanded ? "Recolher" : "Expandir"} Fundamentos`}
          onClick={() => setExpanded((current) => !current)}
          className="flex min-h-16 w-full min-w-0 items-center justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
        >
          <span className="min-w-0">
            <span className="text-display block text-sm text-accent">Comece do zero</span>
            <span className="text-display mt-1 block break-words text-3xl sm:text-4xl">
              Fundamentos
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
              Toque para {expanded ? "recolher" : "conhecer"} os passos essenciais antes das manobras.
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-6 shrink-0 text-primary transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <div id="fundamentos-content" hidden={!expanded} className="mt-6">
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Antes das manobras, construa confiança no skate. Vá no seu ritmo, pratique
              em um lugar seguro e volte a estes passos sempre que precisar.
            </p>

            <div data-testid="fundamentos-grid" className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {fundamentals.map((item) => (
            <article
              key={item.title}
              className="group min-w-0 rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none"
            >
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <h3 className="text-display min-w-0 break-words text-xl leading-tight sm:text-2xl">
                  {item.title}
                </h3>
                <span className="text-display max-w-full rounded-full border border-primary/40 bg-secondary px-3 py-1 text-xs text-primary">
                  {item.focus}
                </span>
              </div>

              <p className="mt-3 break-words text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>

              <div className="mt-5 rounded-md border-l-2 border-primary bg-secondary/50 p-4 transition-colors group-hover:bg-secondary/80">
                <p className="text-display text-xs text-primary">Experimente</p>
                <ul className="mt-3 space-y-3">
                  {item.steps.map((step) => (
                    <li key={step} className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <p className="min-w-0 break-words text-sm leading-relaxed">
                        {step}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
            </div>

            <a
              href="#trilha"
              className="text-display mt-6 inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-accent transition-colors hover:border-primary hover:text-primary"
            >
              Ir para a trilha de manobras
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </a>
        </div>
      </div>
    </section>
  );
}
