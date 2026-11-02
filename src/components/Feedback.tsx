import { useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  hasInvalidFeedbackInput,
  MAX_FEEDBACK_LENGTH,
  sanitizeFeedback,
} from "@/lib/feedback";

const MAX_FEEDBACKS_PER_SESSION = 3;
const FEEDBACK_SESSION_STORAGE_KEY = "brz-tricks:feedback-count";

function readFeedbackCount(): number {
  try {
    const storedCount = Number(window.sessionStorage.getItem(FEEDBACK_SESSION_STORAGE_KEY));
    return Number.isInteger(storedCount) && storedCount > 0 ? storedCount : 0;
  } catch {
    return 0;
  }
}

function storeFeedbackCount(count: number): void {
  try {
    window.sessionStorage.setItem(FEEDBACK_SESSION_STORAGE_KEY, String(count));
  } catch {
    // O formulário continua utilizável caso o navegador bloqueie o armazenamento.
  }
}

export function Feedback() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [invalidInput, setInvalidInput] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    setFeedbackCount(readFeedbackCount());
  }, []);

  const limitReached = feedbackCount >= MAX_FEEDBACKS_PER_SESSION;

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const currentCount = readFeedbackCount();
    if (currentCount >= MAX_FEEDBACKS_PER_SESSION) {
      setFeedbackCount(currentCount);
      setStatus("Você já enviou os 3 feedbacks permitidos nesta sessão.");
      return;
    }

    if (invalidInput || hasInvalidFeedbackInput(message)) {
      setStatus(
        "Use apenas texto simples, sem marcação ou caracteres de controle, com até 1.000 caracteres.",
      );
      return;
    }

    const cleanMessage = sanitizeFeedback(message).trim();
    if (!cleanMessage) {
      setStatus("Escreva uma sugestão antes de enviar.");
      return;
    }

    setSending(true);
    setStatus("");

    try {
      const { error } = await supabase
        .from("feedback")
        .insert({ message: cleanMessage });

      if (error?.message.toLowerCase().includes("feedback rate limit exceeded")) {
        setStatus("Você enviou várias sugestões recentemente. Tente novamente em alguns minutos.");
        return;
      }
      if (error) throw error;

      const nextCount = currentCount + 1;
      storeFeedbackCount(nextCount);
      setFeedbackCount(nextCount);
      setMessage("");
      setInvalidInput(false);
      setStatus(
        nextCount >= MAX_FEEDBACKS_PER_SESSION
          ? "Obrigado! Seu feedback foi enviado. Você atingiu o limite de 3 feedbacks nesta sessão."
          : "Obrigado! Seu feedback foi enviado.",
      );
    } catch {
      setStatus("Não foi possível enviar agora. Tente novamente mais tarde.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-title"
      className="mx-auto max-w-xl text-left normal-case tracking-normal"
    >
      <h2 id="feedback-title" className="text-display text-2xl">
        Ajude a melhorar
      </h2>
      <p id="feedback-help" className="mt-2 text-sm text-muted-foreground">
        Tem uma sugestão? Conte para a gente. Não precisa entrar na sua conta. Limite de 3
        feedbacks por sessão.
      </p>

      <form onSubmit={submitFeedback} className="mt-4">
        <label htmlFor="feedback-message" className="text-sm font-medium">
          Seu feedback
        </label>
        <textarea
          id="feedback-message"
          name="message"
          value={message}
          onChange={(event) => {
            const rawValue = event.currentTarget.value;
            const blocked = hasInvalidFeedbackInput(rawValue);
            setInvalidInput(blocked);
            setMessage(sanitizeFeedback(rawValue));
            setStatus(
              blocked
                ? "Caracteres não permitidos foram removidos. Revise o texto antes de enviar."
                : "",
            );
          }}
          maxLength={MAX_FEEDBACK_LENGTH}
          minLength={1}
          rows={4}
          required
          disabled={limitReached}
          aria-invalid={invalidInput}
          aria-describedby="feedback-help feedback-count feedback-status"
          placeholder={
            limitReached
              ? "Limite de 3 feedbacks atingido nesta sessão"
              : "O que podemos melhorar no aplicativo?"
          }
          className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-base leading-relaxed outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span id="feedback-count" className="text-xs text-muted-foreground">
            {Array.from(message).length}/{MAX_FEEDBACK_LENGTH} · {feedbackCount}/
            {MAX_FEEDBACKS_PER_SESSION} nesta sessão
          </span>
          <Button
            type="submit"
            disabled={sending || limitReached || !message.trim() || invalidInput}
            className="text-display min-h-11"
          >
            <Send className="mr-2 size-4" aria-hidden="true" />
            {sending ? "Enviando..." : limitReached ? "Limite atingido" : "Enviar feedback"}
          </Button>
        </div>
        <p
          id="feedback-status"
          role="status"
          aria-live="polite"
          className="mt-3 min-h-5 text-sm text-muted-foreground"
        >
          {status}
        </p>
      </form>
    </section>
  );
}
