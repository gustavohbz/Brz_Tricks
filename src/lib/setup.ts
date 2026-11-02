/* =========================================================
    setup — as medidas do skate que o usuário anota
    ---------------------------------------------------------
    • Módulo seguro para o navegador e funções do servidor.
    • O mesmo allowlist é aplicado ao digitar, ler armazenamento
      local e validar dados recebidos no servidor.
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
 * Aceita caracteres úteis para medidas e especificações do skate:
 * letras, números, espaços, ponto, vírgula, aspas, hífen, barra e parênteses.
 * Remove controles, marcação HTML e qualquer outro caractere.
 */
export function sanitizeSetupValue(value: unknown): string {
  if (typeof value !== "string") return "";
  return Array.from(
    value.normalize("NFC").replace(/[^\p{L}\p{N} .,'"/()-]/gu, ""),
  )
    .slice(0, SETUP_FIELD_MAX)
    .join("")
    .trim();
}

/**
 * Converte qualquer valor recebido em um Setup válido.
 * Guarda só as quatro peças conhecidas e aplica o mesmo allowlist
 * tanto aos valores locais quanto aos enviados para o servidor.
 */
export function sanitizeSetup(input: unknown): Setup {
  const src = (input ?? {}) as Record<string, unknown>;
  const campo = (chave: keyof Setup) => sanitizeSetupValue(src[chave]);
  return {
    truck: campo("truck"),
    shape: campo("shape"),
    wheel: campo("wheel"),
    bearing: campo("bearing"),
  };
}
