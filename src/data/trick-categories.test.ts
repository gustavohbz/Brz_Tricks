import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { sections } from "./tricks";
import {
  DEFAULT_TRICK_SECTION_ID,
  filterTricksByCategory,
} from "./trick-categories";

describe("trick category selection", () => {
  test("starts on the Ollies section", () => {
    strictEqual(DEFAULT_TRICK_SECTION_ID, "ollies");
  });

  test("filters only the selected difficulty in a section", () => {
    const tricks = sections.find((section) => section.id === "ollies")!.tricks;
    const filtered = filterTricksByCategory(tricks, "amador");

    strictEqual(filtered.length > 0, true);
    strictEqual(filtered.every((trick) => trick.categoria === "amador"), true);
  });

  test("returns an empty list when a section has no tricks at a level", () => {
    const tricks = sections.find((section) => section.id === "ollies")!.tricks;
    deepStrictEqual(filterTricksByCategory(tricks, "avancado"), []);
  });

  test("returns all tricks when the all filter is selected", () => {
    const tricks = sections.find((section) => section.id === "ollies")!.tricks;
    deepStrictEqual(filterTricksByCategory(tricks, "todas"), tricks);
  });
});
