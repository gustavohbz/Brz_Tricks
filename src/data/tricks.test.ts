import { test } from "node:test";
import { ok, strictEqual, deepStrictEqual } from "node:assert";
import { sections, CATEGORIAS, categoriaLabel, roadmaps, type Categoria } from "./tricks";

/* As três categorias que o usuário pediu para filtrar */
const VALIDAS: Categoria[] = ["iniciante", "amador", "avancado"];

test("toda manobra tem uma das três categorias", () => {
  for (const s of sections) {
    for (const t of s.tricks) {
      ok(VALIDAS.includes(t.categoria));
    }
  }
});

test("o catálogo mantém opções nas três categorias para filtrar", () => {
  const categoriasDisponiveis = new Set(
    sections.flatMap((section) => section.tricks.map((trick) => trick.categoria)),
  );
  for (const categoria of VALIDAS) {
    strictEqual(categoriasDisponiveis.has(categoria), true);
  }
});

test("não exibe as manobras removidas nem mantém seus roadmaps", () => {
  const removidas = [
    "Ollie no Meio-fio",
    "Ollie na Escada",
    "Body Varial",
    "Powerslide",
    "Kickflip no Meio-fio",
  ];
  const nomes = new Set(sections.flatMap((section) => section.tricks.map((trick) => trick.name)));

  for (const nome of removidas) {
    strictEqual(nomes.has(nome), false);
    strictEqual(roadmaps[nome], undefined);
  }
});

test("filtrar por categoria separa as manobras sem repetir nem perder nenhuma", () => {
  for (const s of sections) {
    const somadas = VALIDAS.map(
      (c) => s.tricks.filter((t) => t.categoria === c).length,
    );
    // Categorias sem manobras nesta seção podem retornar zero resultados.
    // a soma das três categorias é exatamente o tamanho do tipo
    strictEqual(somadas.reduce((a, b) => a + b, 0), s.tricks.length);
  }
});

test("o filtro oferece Todas + as três categorias", () => {
  deepStrictEqual(CATEGORIAS.map((c) => c.value), [
    "todas",
    "iniciante",
    "amador",
    "avancado",
  ]);
});

test("cada categoria tem um rótulo bonito", () => {
  strictEqual(categoriaLabel.iniciante, "Iniciante");
  strictEqual(categoriaLabel.amador, "Amador");
  strictEqual(categoriaLabel.avancado, "Avançado");
});
