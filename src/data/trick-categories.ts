import type { Categoria, Trick } from "./tricks";

export const DEFAULT_TRICK_SECTION_ID = "ollies" as const;
export type TrickCategoryFilter = Categoria | "todas";

export function filterTricksByCategory(
  tricks: readonly Trick[],
  categoria: TrickCategoryFilter,
): Trick[] {
  if (categoria === "todas") return [...tricks];
  return tricks.filter((trick) => trick.categoria === categoria);
}
