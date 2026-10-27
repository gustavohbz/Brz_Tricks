import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MAX_FEEDBACK_LENGTH, sanitizeFeedback } from "@/lib/feedback";

export function Feedback() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

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

      if (error) throw error;

      setMessage("");
      setStatus("Obrigado! Seu feedback foi enviado.");
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
        Tem uma sugestão? Conte para a gente. Não precisa entrar na sua conta.
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
            setMessage(sanitizeFeedback(event.currentTarget.value));
            setStatus("");
          }}
          maxLength={MAX_FEEDBACK_LENGTH}
          minLength={1}
          rows={4}
          required
          aria-describedby="feedback-help feedback-count feedback-status"
          placeholder="O que podemos melhorar no aplicativo?"
          className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-base leading-relaxed outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <span id="feedback-count" className="text-xs text-muted-foreground" aria-live="polite">
            {message.length}/{MAX_FEEDBACK_LENGTH}
          </span>
          <Button type="submit" disabled={sending || !message.trim()} className="text-display min-h-11">
            <Send className="mr-2 size-4" aria-hidden="true" />
            {sending ? "Enviando..." : "Enviar feedback"}
          </Button>
        </div>
        <p id="feedback-status" role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
          {status}
        </p>
      </form>
    </section>
  );
}
