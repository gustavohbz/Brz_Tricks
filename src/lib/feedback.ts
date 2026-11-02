export const MAX_FEEDBACK_LENGTH = 1000;

const FORBIDDEN_CHARACTERS =
  /[<>\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/u;
const FORBIDDEN_CHARACTERS_GLOBAL =
  /[<>\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/gu;

/** Detecta marcação, controles, caracteres invisíveis e texto acima do limite. */
export function hasInvalidFeedbackInput(value: string): boolean {
  return (
    FORBIDDEN_CHARACTERS.test(value) ||
    Array.from(value).length > MAX_FEEDBACK_LENGTH
  );
}

/**
 * Aceita texto Unicode simples, preserva quebras de linha e remove marcação,
 * controles e caracteres invisíveis. Também limita por ponto de código.
 */
export function sanitizeFeedback(value: string): string {
  return Array.from(
    value
      .normalize("NFC")
      .replace(/\r\n?/gu, "\n")
      .replace(FORBIDDEN_CHARACTERS_GLOBAL, ""),
  )
    .slice(0, MAX_FEEDBACK_LENGTH)
    .join("");
}
