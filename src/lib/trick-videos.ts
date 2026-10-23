/* =========================================================
   LINKS DE VÍDEO DAS MANOBRAS
   ---------------------------------------------------------
   Guarda no navegador (localStorage) um mapa
   { "Kickflip": "https://.../video.mp4" } com os links que o
   usuário cola dentro do popup de cada manobra.
   ========================================================= */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "trick-videos";

export type VideoMap = Record<string, string>;

/** Aceita apenas http(s) — evita javascript:/data: em src de vídeo. */
export function isValidVideoUrl(url: string): boolean {
  const v = url.trim();
  if (!v || v.length > 500) return false;
  if (v.startsWith("/")) return true; // arquivo local em public/
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Extrai o código do vídeo de um link do YouTube; null se não for YouTube. */
export function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  return m?.[1] ?? null;
}

/** Converte link do YouTube em URL de embed; devolve null se não for YouTube. */
export function youtubeEmbed(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

/** URL da capa do vídeo (a "previewzinha" mostrada antes do clique). */
export function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Hook: lê/salva os links de vídeo das manobras. */
export function useTrickVideos() {
  const [videos, setVideos] = useState<VideoMap>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVideos(JSON.parse(raw) as VideoMap);
    } catch {
      /* dados inválidos: ignora */
    }
  }, []);

  const persist = (next: VideoMap) => {
    setVideos(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage indisponível */
    }
  };

  const setVideo = useCallback((name: string, url: string) => {
    setVideos((prev) => {
      const next = { ...prev, [name]: url.trim() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage indisponível */
      }
      return next;
    });
  }, []);

  const removeVideo = useCallback((name: string) => {
    setVideos((prev) => {
      const next = { ...prev };
      delete next[name];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage indisponível */
      }
      return next;
    });
  }, []);

  return { videos, setVideo, removeVideo, persist };
}
