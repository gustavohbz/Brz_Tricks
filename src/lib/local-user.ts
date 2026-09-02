/* =========================================================
   local-user — identidade simples, sem login externo
   ---------------------------------------------------------
   • Um id (uuid) é gerado uma única vez e guardado no navegador.
   • O usuário escolhe apenas nome e avatar (URL da imagem).
   • Nada de senha, e-mail ou OAuth: é só uma identidade local.
   ========================================================= */
import { useCallback, useEffect, useState } from "react";

export type LocalUser = {
  id: string;
  name: string;
  avatar: string;
};

const KEY = "skate-do-zero:user";
const EVENT = "skate-do-zero:user-change";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Lê (ou cria) a identidade guardada no navegador. */
export function readLocalUser(): LocalUser {
  if (typeof window === "undefined") return { id: "", name: "", avatar: "" };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalUser>;
      if (parsed.id) {
        return {
          id: parsed.id,
          name: parsed.name ?? "",
          avatar: parsed.avatar ?? "",
        };
      }
    }
  } catch {
    /* ignora dados corrompidos */
  }
  const fresh: LocalUser = { id: uuid(), name: "", avatar: "" };
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    /* ignora */
  }
  return fresh;
}

/** Salva nome/avatar mantendo o mesmo id. */
export function saveLocalUser(patch: Partial<Omit<LocalUser, "id">>) {
  const current = readLocalUser();
  const next: LocalUser = {
    id: current.id,
    name: (patch.name ?? current.name).slice(0, 40),
    avatar: (patch.avatar ?? current.avatar).slice(0, 500),
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT));
  return next;
}

/** Hook reativo: qualquer componente vê a mesma identidade. */
export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    setUser(readLocalUser());
    const sync = () => setUser(readLocalUser());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<Omit<LocalUser, "id">>) => {
    setUser(saveLocalUser(patch));
  }, []);

  return { user, update, displayName: user?.name?.trim() || "Skater" };
}
