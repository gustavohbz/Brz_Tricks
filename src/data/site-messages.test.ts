import { describe, test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { markNotificationsRead, parseReadNotifications } from "./site-messages";

describe("notification read state", () => {
  test("marks only the selected notification without duplicates", () => {
    deepStrictEqual(markNotificationsRead(["training"], ["profile", "training"]), ["training", "profile"]);
  });
  test("restores saved read identifiers and recovers invalid storage", () => {
    deepStrictEqual(parseReadNotifications('["training",7]'), ["training"]);
    deepStrictEqual(parseReadNotifications("invalid"), []);
  });
});