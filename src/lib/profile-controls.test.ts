import { test } from "node:test";
import { deepStrictEqual } from "node:assert";
import { profileControls } from "./profile-controls";

test("new visitors can enter and create a profile", () => {
  deepStrictEqual(profileControls({ signedIn: false, rememberedLogin: false, localName: "" }), {
    showSignIn: true, label: "Criar meu perfil",
  });
});

test("a saved local profile hides entry and uses Perfil", () => {
  deepStrictEqual(profileControls({ signedIn: false, rememberedLogin: false, localName: "Gustavo" }), {
    showSignIn: false, label: "Perfil",
  });
});

test("remembered login uses Perfil even without an active session", () => {
  deepStrictEqual(profileControls({ signedIn: false, rememberedLogin: true }), {
    showSignIn: false, label: "Perfil",
  });
});

test("active Google session uses Perfil without a local identity", () => {
  deepStrictEqual(profileControls({ signedIn: true, rememberedLogin: false }), {
    showSignIn: false, label: "Perfil",
  });
});