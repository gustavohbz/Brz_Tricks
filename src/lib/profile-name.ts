/** Regras para nomes locais: até 23 letras Unicode e espaços. */
export const MAX_PROFILE_NAME_LENGTH = 23;

export function sanitizeProfileName(value: string): string {
  return Array.from(value.normalize("NFC").replace(/[^\p{L} ]/gu, ""))
    .slice(0, MAX_PROFILE_NAME_LENGTH)
    .join("");
}

export function normalizeProfileName(value: string): string {
  return sanitizeProfileName(value).trim();
}
