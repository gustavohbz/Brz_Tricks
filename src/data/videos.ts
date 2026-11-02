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

/* ---------------------------------------------------------
   COMO FUNCIONA
   1. Cada objeto abaixo vira um card na seção "Vídeos recomendados".
   2. A ordem da lista é a ordem em que os cards aparecem na tela.
   3. `id` precisa ser único: é ele que diz qual card está tocando
      (só um vídeo toca por vez).
   4. A partir de `url`, youtubeThumb() monta a capa e youtubeEmbed()
      monta o player incorporado (src/lib/trick-videos.ts).
   5. Para adicionar: copie um bloco, troque id/título/canal/descrição
      e cole o link do YouTube. Para remover: apague o bloco.
   --------------------------------------------------------- */
export const recommendedVideos: RecommendedVideo[] = [
  {
    id: "shane-goes-2",
    title: "Shane Goes 2",
    author: "ThrasherMagazine",
    desc: "Boa para assistir quando precisar de inspiração antes de treinar.",
    url: "https://www.youtube.com/watch?v=Q_5yQ-5zLXM",
  },
  {
    id: "braille-ollie-tutorial",
    title: "The Fastest Way to Learn How to Ollie",
    author: "Braille Skateboarding",
    desc: "Tutorial passo a passo para quem está aprendendo o ollie.",
    url: "https://www.youtube.com/watch?v=QkeOAcj8Y5k",
  },
  {
    id: "lawrence-ravail-reunion",
    title: "Lawrence Ravail's \"Réunion\" Part",
    author: "ThrasherMagazine",
    desc: "Part completa para ver manobras de rua bem executadas.",
    url: "https://www.youtube.com/watch?v=p6H-Q_pXUec",
  },
];
