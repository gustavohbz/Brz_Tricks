/* =========================================================
    local-user — identidade simples, sem login externo
    ---------------------------------------------------------
    • Um id (uuid) é gerado uma única vez e guardado no navegador
      (localStorage), servindo como "dono" dos comentários.
    • O usuário escolhe apenas nome e avatar (URL da imagem).
    • Nada de senha, e-mail ou OAuth: é só uma identidade local.
    • Um evento customizado avisa toda a tela quando a identidade
      muda, para todos os componentes atualizarem juntos.
    ========================================================= */
import { useCallback, useEffect, useState } from "react";

/* Formato da identidade guardada no navegador */
export type LocalUser = {
  id: string; // uuid estável — nunca muda depois de criado
  name: string; // nome de exibição (pode ficar vazio)
  avatar: string; // URL da imagem de avatar (pode ficar vazio)
};

/* Chave usada no localStorage para persistir a identidade */
const KEY = "skate-do-zero:user";

/* Nome do evento disparado na janela sempre que a identidade muda.
   Os componentes escutam esse evento para re-renderizar. */
const EVENT = "skate-do-zero:user-change";

/* Gera um id único. Prefere crypto.randomUUID() (nativo dos
   navegadores modernos) e cai num fallback simples se não existir. */
function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + número aleatório em hexadecimal
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Lê a identidade guardada no navegador.
 * Se ainda não existir (primeira visita), cria uma nova com id
 * fresco e nome/avatar vazios, já salvando no localStorage.
 * No servidor (SSR) não existe window, então devolve um vazio.
 */
export function readLocalUser(): LocalUser {
  if (typeof window === "undefined") return { id: "", name: "", avatar: "" };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalUser>;
      // Só aceita o registro se tiver um id válido
      if (parsed.id) {
        return {
          id: parsed.id,
          name: parsed.name ?? "",
          avatar: parsed.avatar ?? "",
        };
      }
    }
  } catch {
    /* JSON corrompido ou localStorage bloqueado: cria do zero */
  }
  // Primeira visita (ou dado inválido): cria identidade nova
  const fresh: LocalUser = { id: uuid(), name: "", avatar: "" };
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    /* localStorage pode estar cheio/bloqueado — segue sem salvar */
  }
  return fresh;
}

/**
 * Salva nome/avatar mantendo o MESMO id (senão os comentários
 * antigos deixariam de pertencer ao usuário).
 * Limita os tamanhos para não estourar o localStorage e, ao final,
 * dispara o evento para avisar os componentes.
 */
export function saveLocalUser(patch: Partial<Omit<LocalUser, "id">>) {
  const current = readLocalUser();
  const next: LocalUser = {
    id: current.id, // id nunca é alterado
    name: (patch.name ?? current.name).slice(0, 40), // nome: até 40 caracteres
    avatar: (patch.avatar ?? current.avatar).slice(0, 500), // URL: até 500
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  // Avisa a tela inteira que a identidade mudou
  window.dispatchEvent(new CustomEvent(EVENT));
  return next;
}

/**
 * Hook reativo: qualquer componente que usar useLocalUser() vê a
 * mesma identidade e re-renderiza quando ela muda — seja por este
 * componente (evento EVENT) ou por outra aba (evento "storage").
 *
 * Retorna:
 *  - user: identidade (null durante a hidratação/SSR)
 *  - update: função para salvar nome/avatar
 *  - displayName: nome pronto para exibir ("Skater" se vazio)
 */
export function useLocalUser() {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    // Lê a identidade assim que o componente monta no navegador
    setUser(readLocalUser());

    // Re-lê a identidade quando ela muda nesta aba ou em outra
    const sync = () => setUser(readLocalUser());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // sincroniza entre abas
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Atalho para salvar e já refletir no estado local
  const update = useCallback((patch: Partial<Omit<LocalUser, "id">>) => {
    setUser(saveLocalUser(patch));
  }, []);

  // Se o usuário ainda não escolheu nome, exibe "Skater"
  return { user, update, displayName: user?.name?.trim() || "Skater" };
}
