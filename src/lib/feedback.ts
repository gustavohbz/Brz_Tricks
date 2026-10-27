export const MAX_FEEDBACK_LENGTH = 1000;

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Keeps feedback as plain text, removing markup delimiters and control
 * characters before it is displayed or sent to the database.
 */
export function sanitizeFeedback(value: string): string {
  return value
    .replace(/[<>]/g, "")
    .replace(CONTROL_CHARACTERS, "")
    .slice(0, MAX_FEEDBACK_LENGTH);
}
