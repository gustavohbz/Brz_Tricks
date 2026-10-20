import { describe, expect, test } from "bun:test";
import { markNotificationsRead, parseReadNotifications } from "./site-messages";

describe("notification read state", () => {
  test("marks only the selected notification without duplicates", () => {
    expect(markNotificationsRead(["training"], ["profile", "training"])).toEqual(["training", "profile"]);
  });
  test("restores saved read identifiers and recovers invalid storage", () => {
    expect(parseReadNotifications('["training",7]')).toEqual(["training"]);
    expect(parseReadNotifications("invalid")).toEqual([]);
  });
});