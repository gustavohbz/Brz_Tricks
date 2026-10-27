/* =========================================================
   PÁGINA INICIAL  ( / )
   ---------------------------------------------------------
   Landing page completa da wiki de manobras.
   Ordem do arquivo:
     1) IMPORTS
     2) ROUTE + SEO            → registro da rota "/" e metatags
     3) TrickHoverPreview      → popup que abre no HOVER (com vídeo)
     4) TrickRoadmap           → linha do tempo de pré-requisitos
     5) Index()                → a página em si (estado + seções)
   Todo o CONTEÚDO vem de src/data/tricks.ts — aqui só tem UI.
   Documentação completa: DOCUMENTACAO.md
   ========================================================= */

/* =========================================================
   1) IMPORTS
   ========================================================= */
import { createFileRoute, Link } from "@tanstack/react-router"; // registra o arquivo como rota + links internos
import { useEffect, useState } from "react"; // hooks usados nesta página
import { ChevronDown, PlayCircle } from "lucide-react"; // ícones



import { getRoadmap, categoriaLabel, type Trick } from "@/data/tricks";
import { TrickCategoryTabs } from "@/components/TrickCategoryTabs";
import { Dicas } from "@/components/Dicas"; // seção de curiosidades e dicas
import { AdvertisingBanner } from "@/components/AdvertisingBanner";
import { Pistas } from "@/components/Pistas"; // seção de pistas de skate (mapa + comentários)
import { VideosRecomendados } from "@/components/VideosRecomendados"; // seção de vídeos recomendados
import {
  useTrickVideos,
  youtubeEmbed,
  isValidVideoUrl,
} from "@/lib/trick-videos"; // links de vídeo salvos pelo usuário
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/* =========================================================
   2) ROUTE + SEO
   O nome do arquivo define a URL: index.tsx => "/".
   head() alimenta <title> e as metatags (Google + preview em redes).
   ========================================================= */
export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "Brauza Skate Co. — Ollies, Variais e Flip's" },
      {
        name: "description",
        content:
          "Comece no skate pelo caminho certo: 30 manobras explicadas passo a passo em Ollies, Variais e Flip's.",
      },
      { property: "og:title", content: "Brauza Skate Co. — Ollies, Variais e Flip's" },
      {
        property: "og:description",
        content: "Guia iniciante de skate com 30 manobras explicadas passo a passo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* =========================================================
   3) TrickHoverPreview — popup de HOVER (com vídeo)
   Renderizado dentro de <HoverCard> (ver seção 3 da página).
   Se a manobra tiver `video`, toca em loop/mudo; senão mostra
   o placeholder "Vídeo em breve".
   ========================================================= */
function TrickHoverPreview({ trick, videoUrl }: { trick: Trick; videoUrl?: string | undefined }) {
  // link colado pelo usuário tem prioridade sobre o do arquivo de dados
  const src = videoUrl || trick.video;
  const embed = src ? youtubeEmbed(src) : null;

  return (
    <HoverCardContent
      side="top"
      align="center"
      className="w-72 border-border bg-popover p-0 overflow-hidden"
    >
      {/* --- área de vídeo --- */}
      <div className="aspect-video w-full bg-secondary">
        {embed ? (
          <iframe
            src={embed}
            title={trick.name}
            allow="autoplay; encrypted-media"
            className="size-full"
          />
        ) : src ? (
          <video src={src} muted loop autoPlay playsInline className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <PlayCircle className="size-7" />
            <span className="text-[10px] uppercase tracking-widest">Vídeo em breve</span>
          </div>
        )}
      </div>

      {/* --- texto --- */}
      <div className="p-4">
        <span className="text-display text-xs text-primary">{trick.level}</span>
        <p className="text-display text-xl leading-tight">{trick.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{trick.desc}</p>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-accent">
          Clique para ver o roadmap
        </p>
      </div>
    </HoverCardContent>
  );
}

/* =========================================================
   4) TrickRoadmap — linha do tempo de pré-requisitos
   Busca a lista em roadmaps (src/data/tricks.ts).
   Sem roadmap cadastrado => não renderiza nada (return null).
   O último ponto é destacado: é a manobra alvo.
   ========================================================= */
function TrickRoadmap({ name }: { name: string }) {
  const steps = getRoadmap(name); // ex.: Kickflip => ["Ollie firme", ...]
  if (steps.length === 0) return null;


  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-display text-xs text-accent">Roadmap até a manobra</p>

      <ol className="relative mt-4 space-y-4 pl-5">
        {/* linha vertical */}
        <span className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
        {steps.map((step, i) => (
          <li key={step} className="relative flex items-center gap-3">
            <span
              className={`absolute -left-5 size-[11px] rounded-full border-2 ${
                i === steps.length - 1
                  ? "border-primary bg-primary"
                  : "border-muted-foreground bg-background"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* =========================================================
   4.5) TrickVideoField — player + campo para colar o link
   O link é salvo no navegador (localStorage) por manobra e
   aparece também no popup de hover.
   ========================================================= */
function TrickVideoField({
  trick,
  videoUrl,
  onSave,
  onRemove,
}: {
  trick: Trick;
  videoUrl?: string | undefined;
  onSave: (url: string) => void;
  onRemove: () => void;
}) {
  const current = videoUrl || trick.video || "";
  const [draft, setDraft] = useState(videoUrl ?? "");
  const [error, setError] = useState("");

  // ao trocar de manobra, recarrega o campo com o link daquela manobra
  useEffect(() => {
    setDraft(videoUrl ?? "");
    setError("");
  }, [trick.name, videoUrl]);

  const embed = current ? youtubeEmbed(current) : null;

  const save = () => {
    const value = draft.trim();
    if (!value) {
      onRemove();
      setError("");
      return;
    }
    if (!isValidVideoUrl(value)) {
      setError("Use um link http(s) de vídeo ou do YouTube.");
      return;
    }
    setError("");
    onSave(value);
  };

  return (
    <div className="mt-2">
      {/* --- player --- */}
      {current ? (
        embed ? (
          <iframe
            src={embed}
            title={trick.name}
            allow="autoplay; encrypted-media; fullscreen"
            className="aspect-video w-full rounded-md bg-secondary"
          />
        ) : (
          <video
            src={current}
            controls
            playsInline
            className="aspect-video w-full rounded-md bg-secondary object-cover"
          />
        )
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-md bg-secondary text-muted-foreground">
          <PlayCircle className="size-7" />
          <span className="text-[10px] uppercase tracking-widest">Sem vídeo ainda</span>
        </div>
      )}

      {/* --- campo do link --- */}
      <div className="mt-3 rounded-md border border-border p-3">
        <label
          htmlFor={`link-${trick.name}`}
          className="text-display text-xs text-primary"
        >
          Link do vídeo desta manobra
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id={`link-${trick.name}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 500))}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="https://youtube.com/watch?v=... ou /videos/kickflip.mp4"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary sm:text-sm"
          />
          <Button onClick={save} className="text-display shrink-0">
            Salvar
          </Button>
        </div>
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Aceita YouTube, Shorts ou arquivo .mp4/.webm. Salvo neste navegador.
          </p>
        )}
        {videoUrl && (
          <button
            onClick={() => {
              setDraft("");
              onRemove();
            }}
            className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            Remover link
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   5) PÁGINA
   ---------------------------------------------------------
   ESTADO (hooks):
   • started → false = só o hero aparece. Vira true no clique em
     "Confira" e libera trilha + seções + footer.
   • trick   → manobra selecionada. null = modal fechado;
     objeto = modal aberto com aquela manobra.
   FUNÇÃO:
   • go(id)  → rolagem suave até a <section> com aquele id.
   ========================================================= */
function Index() {
  const [started, setStarted] = useState(false);
  const [trick, setTrick] = useState<Trick | null>(null);
  // mapa { manobra: link } salvo no navegador, editado dentro do popup
  const { videos, setVideo, removeVideo } = useTrickVideos();

  // rola suavemente até a seção pedida (usado pelo CTA e pelos 3 cards)
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // fallback: alguns contextos (iframe do preview) ignoram scrollIntoView
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // ao liberar a trilha, espera a renderização antes de rolar
  useEffect(() => {
    if (!started) return;
    const id = requestAnimationFrame(() => go("trilha"));
    return () => cancelAnimationFrame(id);
  }, [started]);



  return (
    <main className="min-h-screen bg-background pt-14 font-sans text-foreground">
      <AdvertisingBanner />
      {/* =====================================================
          SEÇÃO 1 — WELCOME
          ===================================================== */}
      <section className="surface-asphalt relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center sm:px-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,transparent_0_38px,currentColor_38px_39px)]" />
        <p className="text-display relative text-sm text-primary">
          Bem-vindo à sua Wiki de Manobras
        </p>
        <h1 className="text-display relative mt-4 text-5xl leading-[0.95] sm:text-8xl md:text-9xl">
          Brauza
          <br />
          <span className="text-primary">Skate Co.</span>
        </h1>
        <p className="relative mt-6 max-w-md text-base text-muted-foreground">
          Seu Aplicativo de Skatista para Skatista!
          <br />
          Aqui tem tudo que você precisa.
        </p>

        <div className="relative mt-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={() => setStarted(true)}
            className="text-display ring-glow h-14 px-10 text-lg"
          >
            Confira
          </Button>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Outros níveis em breve
          </span>
        </div>

        <ChevronDown className="relative mt-16 size-6 animate-bounce text-primary" />
      </section>

      {started && (
        <>
          <TrickCategoryTabs
            onNavigate={go}
            renderTrick={(t, i) => (
              <HoverCard key={t.name} openDelay={120} closeDelay={80}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => setTrick(t)}
                    className="min-w-0 break-words rounded-md border border-border bg-card px-4 py-5 text-left transition-all hover:border-primary hover:bg-secondary"
                  >
                    <span className="text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-display mt-1 block text-lg leading-tight">
                      {t.name}
                    </span>
                    <span className="text-display mt-1 block text-[10px] uppercase tracking-widest text-accent">
                      {categoriaLabel[t.categoria]}
                    </span>
                  </button>
                </HoverCardTrigger>
                <TrickHoverPreview trick={t} videoUrl={videos[t.name]} />
              </HoverCard>
            )}
          />

          {/* =================================================
              SEÇÃO 5 — PISTAS DE SKATE (mapa + comentários)
              ================================================= */}
          <section id="pistas" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
            <Pistas />
          </section>

          {/* =================================================
              SEÇÃO 6 — DICAS & CURIOSIDADES
              ================================================= */}
          <section id="dicas" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
            <Dicas />
          </section>

          {/* =================================================
              SEÇÃO 7 — VÍDEOS RECOMENDADOS (prévia + player)
              ================================================= */}
          <section id="videos" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
            <VideosRecomendados />
          </section>


          {/* =================================================
              SEÇÃO 8 — CRONOGRAMA DE TREINOS
              ================================================= */}
          <section id="cronograma" className="border-t border-border px-4 py-16 sm:px-6 sm:py-24">
            {/* Chamada para a área de treinos (cronograma salvo na conta) */}
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-display text-xs tracking-widest text-primary">
                Seu treino
              </p>
              <h2 className="text-display mt-2 text-5xl">Cronograma de treinos</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Monte sua semana escolhendo as manobras que quer treinar. Com uma
                conta, o cronograma fica salvo na nuvem e você abre de qualquer
                aparelho.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild className="text-display">
                  <Link to="/treinos">Montar meu cronograma</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* =================================================
              FOOTER
              ================================================= */}
          <footer className="border-t border-border px-4 py-8 sm:px-6 sm:py-10 text-center text-xs uppercase tracking-widest text-muted-foreground">
            Caia, levante, repita.
          </footer>
        </>
      )}

      {/* =====================================================
          MODAL — detalhes + passos + roadmap
          ===================================================== */}
      <Dialog open={!!trick} onOpenChange={(o) => !o && setTrick(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-popover">
          {trick && (
            <>
              <DialogHeader>
                <span className="text-display text-xs text-primary">{trick.level}</span>
                <DialogTitle className="text-display break-words pr-8 text-3xl">{trick.name}</DialogTitle>
                <DialogDescription className="break-words text-muted-foreground">
                  {trick.desc}
                </DialogDescription>
              </DialogHeader>

              {/* --- vídeo + campo para colar o link --- */}
              <TrickVideoField
                trick={trick}
                videoUrl={videos[trick.name]}
                onSave={(url) => setVideo(trick.name, url)}
                onRemove={() => removeVideo(trick.name)}
              />

              {/* --- passos --- */}
              <ol className="mt-2 space-y-2">
                {trick.steps.map((step, i) => (
                  <li key={step} className="flex min-w-0 gap-3 text-sm">
                    <span className="text-display text-primary">{i + 1}</span>
                    <span className="min-w-0 break-words">{step}</span>
                  </li>
                ))}
              </ol>

              {/* --- roadmap --- */}
              <TrickRoadmap name={trick.name} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
