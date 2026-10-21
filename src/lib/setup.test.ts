import { describe, test } from "node:test";
import { deepStrictEqual, strictEqual } from "node:assert";
import { emptySetup, sanitizeSetup, SETUP_FIELD_MAX } from "./setup";

describe("skate setup", () => {
  test("keeps only the four known fields, trimmed", () => {
    deepStrictEqual(
      sanitizeSetup({
        truck: "  139mm  ",
        shape: ' 8.0"',
        wheel: "53mm 99A",
        bearing: "Abec 7",
        id: "outra-coisa",
      }),
      { truck: "139mm", shape: '8.0"', wheel: "53mm 99A", bearing: "Abec 7" },
    );
  });

  test("cuts each field at the form limit", () => {
    const setup = sanitizeSetup({ truck: "x".repeat(200) });
    strictEqual(setup.truck.length, SETUP_FIELD_MAX);
    strictEqual(setup.shape, "");
  });

  test("recovers from missing or wrong-typed values", () => {
    deepStrictEqual(sanitizeSetup(null), emptySetup);
    deepStrictEqual(sanitizeSetup({ truck: 12, shape: {} }), emptySetup);
  });
});
