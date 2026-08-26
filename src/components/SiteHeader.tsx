/* =========================================================
   SiteHeader — cabeçalho fixo com login de usuário
   ---------------------------------------------------------
   • Login seguro via Google (OAuth gerenciado pelo backend).
   • A sessão é lida do backend (nunca do localStorage manual).
   • Mostra avatar + nome quando logado, com opção de sair.
   ========================================================= */

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";

/* ---------- ícone oficial do Google (SVG inline) ---------- */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8.6h12.8c-.3 2.1-1.7 5.3-4.9 7.4l7.6 5.9c4.5-4.2 7-10.3 7-17.8z" />
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.5-5.7l-7.6-5.9c-2 1.4-4.7 2.4-7.9 2.4-6.4 0-11.8-3.7-13.7-9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function SiteHeader() {
  /* ---------- estado da sessão ---------- */
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1) listener registrado primeiro (evita perder o evento de login)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    // 2) sessão inicial
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ---------- entrar com Google ---------- */
  const signIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google. Tente novamente.");
      return;
    }
    if (result.redirected) return; // navegador vai para o Google
    setLoading(false);
    toast.success("Bem-vindo!");
  };

  /* ---------- sair ---------- */
  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da conta.");
  };

  const user = session?.user;
  const name =
    (user?.user_metadata?.["full_name"] as string | undefined) ??
    user?.email ??
    "Skater";
  const avatar = user?.user_metadata?.["avatar_url"] as string | undefined;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* marca */}
        <a href="#top" className="text-display text-lg tracking-wide">
          Skate <span className="text-primary">do Zero</span>
        </a>

        {/* área de autenticação */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7">
                  {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
                  <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
                  {name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil">
                  <User className="mr-2 size-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={signIn} disabled={loading} variant="secondary" className="gap-2">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Entrar com Google
          </Button>
        )}
      </div>
    </header>
  );
}
