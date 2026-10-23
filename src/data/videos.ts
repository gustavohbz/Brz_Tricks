/* =========================================================
   VÍDEOS RECOMENDADOS
   ---------------------------------------------------------
   Lista os vídeos da seção "Vídeos recomendados" da página
   inicial. Para incluir um vídeo novo, basta colar o link do
   YouTube aqui: a capa (previewzinha) e o player são gerados
   a partir do link — nada de URL de embed escrita à mão.
   ========================================================= */

export type RecommendedVideo = {
  /** chave única usada para controlar qual preview está tocando */
  id: string;
  title: string;
  /** canal / autor do vídeo */
  author: string;
  desc: string;
  /** link do YouTube (watch, youtu.be ou shorts) */
  url: string;
};

export const recommendedVideos: RecommendedVideo[] = [
  {
    id: "shane-goes-2",
    title: "Shane Goes 2",
    author: "ThrasherMagazine",
    desc: "Boa para assistir quando precisar de inspiração antes de treinar.",
    url: "https://www.youtube.com/watch?v=Q_5yQ-5zLXM",
  },
];
