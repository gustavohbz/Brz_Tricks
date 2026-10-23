/* =========================================================
   VÍDEOS RECOMENDADOS
   ---------------------------------------------------------
   Seção da página inicial: lista os vídeos de src/data/videos.ts.
   Cada card mostra a capa do YouTube (previewzinha). Ao clicar,
   a capa vira o player do próprio YouTube e o vídeo começa ali
   mesmo, sem sair do site.
   ========================================================= */
import { useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import { recommendedVideos } from "@/data/videos";
import { youtubeEmbed, youtubeThumb } from "@/lib/trick-videos";

export function VideosRecomendados() {
  // qual preview virou player (null = todas mostrando a capa)
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-display text-sm text-accent">Assista</p>
      <h2 className="text-display mt-2 text-4xl sm:text-5xl">Vídeos recomendados</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Uma seleção de vídeos para ver antes ou depois do treino. Clique na prévia
        para assistir aqui mesmo.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedVideos.map((video) => {
          const embed = youtubeEmbed(video.url);
          const thumb = youtubeThumb(video.url);
          const isPlaying = playing === video.id && !!embed;

          return (
            <article
              key={video.id}
              className="shadow-street overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* --- previewzinha / player --- */}
              <div className="aspect-video w-full bg-secondary">
                {isPlaying ? (
                  <iframe
                    src={`${embed}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="autoplay; encrypted-media; fullscreen"
                    className="size-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(video.id)}
                    aria-label={`Assistir ${video.title}`}
                    className="group relative block size-full"
                  >
                    {thumb ? (
                      <img
                        src={thumb}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center bg-secondary/70 transition-colors group-hover:bg-secondary/40">
                      <PlayCircle className="size-12 text-primary" />
                    </span>
                  </button>
                )}
              </div>

              {/* --- texto --- */}
              <div className="p-4">
                <p className="text-display text-lg leading-tight">{video.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{video.author}</p>
                <p className="mt-2 text-xs text-muted-foreground">{video.desc}</p>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-display inline-flex items-center gap-1 text-xs text-primary"
                  >
                    Abrir no YouTube <ExternalLink className="size-3" />
                  </a>
                  {isPlaying ? (
                    <button
                      type="button"
                      onClick={() => setPlaying(null)}
                      className="text-display text-xs text-muted-foreground hover:text-primary"
                    >
                      Voltar à prévia
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
