import { describe, test } from "node:test";
import { deepStrictEqual, ok } from "node:assert";
import { recommendedVideos } from "./videos";
import { youtubeEmbed, youtubeThumb } from "../lib/trick-videos";

describe("recommended videos", () => {
  test("the featured link plays inside the site and shows a cover", () => {
    const [first] = recommendedVideos;
    ok(first, "a seção precisa de pelo menos um vídeo");
    deepStrictEqual(youtubeEmbed(first.url), "https://www.youtube.com/embed/Q_5yQ-5zLXM");
    deepStrictEqual(youtubeThumb(first.url), "https://i.ytimg.com/vi/Q_5yQ-5zLXM/hqdefault.jpg");
  });

  test("every recommended video has a unique id and a usable YouTube link", () => {
    const ids = new Set<string>();
    for (const video of recommendedVideos) {
      ok(!ids.has(video.id), `id repetido: ${video.id}`);
      ids.add(video.id);
      ok(youtubeEmbed(video.url), `link que não abre no player: ${video.url}`);
    }
  });
});
