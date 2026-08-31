/* =========================================================
   Dicas — seção de Curiosidades & Dicas
   ---------------------------------------------------------
   • Conteúdo curto e escaneável (cards + filtro por categoria).
   • Cada card abre/fecha o detalhe no clique (accordion leve),
     mantendo a página limpa e fácil de navegar no celular.
   • Só usa tokens semânticos do design system (sem cores fixas).
   ========================================================= */

import { useMemo, useState } from "react";
import { Lightbulb, Shield, Wrench, Brain, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- tipos e conteúdo ---------- */
type Categoria = "Segurança" | "Técnica" | "Equipamento" | "Mentalidade" | "Curiosidade";

type Dica = {
  categoria: Categoria;
  titulo: string;
  resumo: string;
  detalhe: string;
};

const ICONES: Record<Categoria, typeof Lightbulb> = {
  Segurança: Shield,
  Técnica: Lightbulb,
  Equipamento: Wrench,
  Mentalidade: Brain,
  Curiosidade: Sparkles,
};

const DICAS: Dica[] = [
  {
    categoria: "Segurança",
    titulo: "Aprenda a cair primeiro",
    resumo: "Caia rolando, nunca com a mão esticada.",
    detalhe:
      "Antes de tentar qualquer manobra, treine quedas na grama ou em um gramado baixo: dobre os braços, jogue o ombro e role. Punho esticado é a lesão mais comum no skate.",
  },
  {
    categoria: "Segurança",
    titulo: "Capacete não é opcional",
    resumo: "90% das lesões graves são na cabeça.",
    detalhe:
      "Use capacete sempre, mesmo em flatground. Joelheira e luva de pulso valem muito nas primeiras semanas — elas removem o medo, e medo é o que faz você travar no meio da manobra.",
  },
  {
    categoria: "Técnica",
    titulo: "Pés antes de tudo",
    resumo: "Posição errada = manobra impossível.",
    detalhe:
      "Pé de trás no bolso do tail (centro), pé da frente atrás dos parafusos. Marque com fita a posição que funcionou e repita — consistência de pés é 70% do ollie.",
  },
  {
    categoria: "Técnica",
    titulo: "Pratique parado, depois andando",
    resumo: "Na grama → parado no chão → em movimento.",
    detalhe:
      "O shape na grama trava a roda e deixa você sentir o movimento sem medo. Depois faça parado no asfalto e só então em movimento — andar dá mais equilíbrio, não menos.",
  },
  {
    categoria: "Técnica",
    titulo: "Olhe para onde vai, não para os pés",
    resumo: "O corpo segue o olhar.",
    detalhe:
      "Fixar o olhar nos pés desequilibra e encurta o salto. Escolha um ponto 2 a 3 metros à frente e mantenha o olhar lá durante toda a manobra.",
  },
  {
    categoria: "Equipamento",
    titulo: "Roda mole para rua, dura para pista",
    resumo: "78A–87A = conforto. 99A+ = velocidade.",
    detalhe:
      "Rodas mais moles absorvem o asfalto ruim e são melhores para iniciantes na rua. Rodas duras deslizam mais e são ideais para pista lisa e manobras de flip.",
  },
  {
    categoria: "Equipamento",
    titulo: "Truck do tamanho do shape",
    resumo: "Largura do truck ≈ largura do shape.",
    detalhe:
      "Shape 7.75\" pede truck ~ 129mm; 8.0\"–8.25\" pede ~ 139mm. Truck muito estreito deixa o skate instável; muito largo trava o giro e atrapalha o flip.",
  },
  {
    categoria: "Equipamento",
    titulo: "Lixa gasta rouba o seu ollie",
    resumo: "Sem atrito, o pé escorrega no raspão.",
    detalhe:
      "Se a lixa está lisa no bolso do tail e na área do pé da frente, troque. Muita gente acha que perdeu a manobra quando na verdade perdeu o atrito.",
  },
  {
    categoria: "Mentalidade",
    titulo: "Comprometa o salto",
    resumo: "Manobra pela metade machuca mais.",
    detalhe:
      "Desistir no meio é o que causa a maioria das quedas ruins. Se decidiu ir, vá inteiro — e se não estiver confiante, volte um passo no roadmap em vez de tentar pela metade.",
  },
  {
    categoria: "Mentalidade",
    titulo: "15 minutos por dia > 3 horas no sábado",
    resumo: "Memória muscular precisa de frequência.",
    detalhe:
      "Sessões curtas e diárias fixam o movimento muito melhor que treinos longos e raros. Use o cronograma da wiki para dividir as manobras pela semana.",
  },
  {
    categoria: "Curiosidade",
    titulo: "O ollie foi inventado sem rampa",
    resumo: "Alan \"Ollie\" Gelfand, 1978.",
    detalhe:
      "O movimento nasceu em piscinas na Flórida e só depois Rodney Mullen o adaptou para o chão plano em 1982 — foi isso que abriu caminho para praticamente todas as manobras modernas.",
  },
  {
    categoria: "Curiosidade",
    titulo: "Todo flip é um ollie disfarçado",
    resumo: "Muda o raspão, não a base.",
    detalhe:
      "Kickflip, heelflip e variais partem do mesmo ollie: o que muda é a direção do raspão do pé da frente. Por isso um ollie firme destrava dezenas de manobras de uma vez.",
  },
];

const CATEGORIAS: Categoria[] = ["Segurança", "Técnica", "Equipamento", "Mentalidade", "Curiosidade"];

/* =========================================================
   Componente
   ========================================================= */
export function Dicas() {
  const [filtro, setFiltro] = useState<Categoria | "Todas">("Todas");
  const [aberta, setAberta] = useState<string | null>(null);

  const lista = useMemo(
    () => (filtro === "Todas" ? DICAS : DICAS.filter((d) => d.categoria === filtro)),
    [filtro],
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* ---------- cabeçalho ---------- */}
      <p className="text-display text-sm text-accent">Curiosidades &amp; dicas</p>
      <h2 className="text-display mt-2 text-4xl sm:text-5xl">
        O que ninguém te conta no começo
      </h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Toque em um card para abrir a explicação completa. Use os filtros para achar o que
        você precisa agora.
      </p>

      {/* ---------- filtros ---------- */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(["Todas", ...CATEGORIAS] as const).map((c) => {
          const ativo = filtro === c;
          return (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              aria-pressed={ativo}
              className={cn(
                "text-display rounded-full border px-4 py-1.5 text-xs uppercase tracking-wider transition-colors",
                ativo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* ---------- cards ---------- */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {lista.map((d) => {
          const Icone = ICONES[d.categoria];
          const open = aberta === d.titulo;
          return (
            <button
              key={d.titulo}
              onClick={() => setAberta(open ? null : d.titulo)}
              aria-expanded={open}
              className={cn(
                "shadow-street group rounded-lg border bg-card p-5 text-left transition-all hover:-translate-y-0.5",
                open ? "border-primary" : "border-border hover:border-primary",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="rounded-md border border-border bg-secondary p-2 text-primary">
                  <Icone className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-display text-[0.65rem] uppercase tracking-widest text-accent">
                    {d.categoria}
                  </span>
                  <h3 className="text-display mt-0.5 text-xl leading-tight">{d.titulo}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.resumo}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180 text-primary",
                  )}
                />
              </div>

              {/* detalhe expandido */}
              <div
                className={cn(
                  "grid transition-all duration-300",
                  open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <p className="overflow-hidden border-l-2 border-primary pl-3 text-sm leading-relaxed text-foreground/90">
                  {d.detalhe}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
