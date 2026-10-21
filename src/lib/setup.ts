/* =========================================================
    setup — as medidas do skate que o usuário anota
    ---------------------------------------------------------
    • Módulo seguro para o navegador (sem chamadas ao servidor).
    • Usado pela tela de perfil (localStorage) e pelas funções do
      servidor (gravação na conta), para as regras serem as mesmas.
    ========================================================= */

/** As quatro peças que a pessoa anota */
export type Setup = { truck: string; shape: string; wheel: string; bearing: string };

/** Chave do localStorage onde o setup fica quando a pessoa não tem conta */
export const SETUP_KEY = "skate-do-zero:setup";

/** Formulário vazio */
export const emptySetup: Setup = { truck: "", shape: "", wheel: "", bearing: "" };

/** Limite de caracteres por campo (o mesmo do formulário) */
export const SETUP_FIELD_MAX = 60;

/**
 * Converte qualquer valor recebido em um Setup válido.
 * Guarda só as quatro peças conhecidas, recorta espaços e limita
 * cada uma ao tamanho do formulário. Valores que não são texto
 * viram campo vazio — nada de números ou objetos escapando.
 */
export function sanitizeSetup(input: unknown): Setup {
  const src = (input ?? {}) as Record<string, unknown>;
  const campo = (chave: keyof Setup) => {
    const valor = src[chave];
    if (typeof valor !== "string") return "";
    return valor.trim().slice(0, SETUP_FIELD_MAX);
  };
  return {
    truck: campo("truck"),
    shape: campo("shape"),
    wheel: campo("wheel"),
    bearing: campo("bearing"),
  };
}
