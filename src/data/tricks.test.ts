import { test, expect } from "bun:test";
import { sections, CATEGORIAS, categoriaLabel, type Categoria } from "./tricks";

/* As três categorias que o usuário pediu para filtrar */
const VALIDAS: Categoria[] = ["iniciante", "amador", "avancado"];

test("toda manobra tem uma das três categorias", () => {
  for (const s of sections) {
    for (const t of s.tricks) {
      expect(VALIDAS).toContain(t.categoria);
    }
  }
});

test("cada tipo (Ollies, Variais, Flip's) tem as três categorias para filtrar", () => {
  for (const s of sections) {
    const tem = new Set(s.tricks.map((t) => t.categoria));
    for (const c of VALIDAS) {
      expect(tem.has(c)).toBe(true);
    }
  }
});

test("filtrar por categoria separa as manobras sem repetir nem perder nenhuma", () => {
  for (const s of sections) {
    const somadas = VALIDAS.map(
      (c) => s.tricks.filter((t) => t.categoria === c).length,
    );
    // nenhuma categoria fica vazia
    for (const n of somadas) expect(n).toBeGreaterThan(0);
    // a soma das três categorias é exatamente o tamanho do tipo
    expect(somadas.reduce((a, b) => a + b, 0)).toBe(s.tricks.length);
  }
});

test("o filtro oferece Todas + as três categorias", () => {
  expect(CATEGORIAS.map((c) => c.value)).toEqual([
    "todas",
    "iniciante",
    "amador",
    "avancado",
  ]);
});

test("cada categoria tem um rótulo bonito", () => {
  expect(categoriaLabel.iniciante).toBe("Iniciante");
  expect(categoriaLabel.amador).toBe("Amador");
  expect(categoriaLabel.avancado).toBe("Avançado");
});
