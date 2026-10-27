/* =========================================================
    SiteHeader — cabeçalho fixo com identidade local
    ---------------------------------------------------------
    • Fixo no topo de todas as páginas, com logo à esquerda.
    • À direita, duas situações possíveis:
      - Usuário ainda SEM nome → botão "Criar meu perfil".
      - Usuário COM nome → menu suspenso com avatar e opções.
    • A edição acontece num popup (Dialog) com nome + URL do avatar.
    • Tudo é salvo só no navegador (src/lib/local-user.ts).
    ========================================================= */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, LogOut, User } from "lucide-react";
import { useLocalUser } from "@/lib/local-user";
import { useAuth } from "@/lib/use-auth";
import { LOGIN_HISTORY_KEY, profileControls } from "@/lib/profile-controls";
import { NotificationBell } from "@/components/NotificationBell";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function sanitizeName(value: string) {
  return Array.from(value.normalize("NFC").replace(/[^\p{L} ]/gu, ""))
    .slice(0, 23)
    .join("");
}

export function SiteHeader() {
  // Identidade local reativa (id + nome + avatar)
  const { user, update, displayName } = useLocalUser();

  // Conta com Google (para o cronograma na nuvem)
  const { user: conta, signOut } = useAuth();
  const [rememberedLogin, setRememberedLogin] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        setRememberedLogin(localStorage.getItem(LOGIN_HISTORY_KEY) === "true");
      } catch {
        // Storage may be unavailable; an active session still shows Perfil.
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!conta) return;
    setRememberedLogin(true);
    try {
      localStorage.setItem(LOGIN_HISTORY_KEY, "true");
    } catch {
      // Remembering a visit is optional and does not grant account access.
    }
  }, [conta]);

  const controls = profileControls({
    signedIn: Boolean(conta), rememberedLogin,
    localName: user?.name ?? "", localAvatar: user?.avatar ?? "",
  });

  // Controla se o popup de edição está aberto
  const [open, setOpen] = useState(false);

  // Campos do formulário do popup (editáveis antes de salvar)
  const [nome, setNome] = useState("");

  // Quando a identidade carregar (ou mudar), preenche o formulário
  // com os valores atuais para o usuário editar em cima deles.
  useEffect(() => {
    if (!user) return;
    setNome(sanitizeName(user.name));
  }, [user]);

  // Salva nome/avatar digitados na identidade local e fecha o popup
  const salvar = () => {
    update({ name: sanitizeName(nome).trim() });
    setOpen(false);
    toast.success("Identidade salva neste navegador!");
  };

  // Apaga nome e avatar (o id continua o mesmo — os comentários
  // antigos continuam pertencendo ao usuário)
  const limpar = () => {
    update({ name: "", avatar: "" });
    toast.success("Nome e avatar removidos.");
  };

  // Decide qual lado direito mostrar: menu (com nome) ou botão
  const temNome = !!user?.name?.trim();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo — volta para o topo da home */}
        <Link to="/" className="text-display shrink-0 text-lg tracking-wide">
          Brauza <span className="text-primary">Skate Co.</span>
        </Link>

        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <NotificationBell />
        {temNome ? (
          /* -------- usuário COM nome: menu suspenso -------- */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2" aria-label="Perfil" title="Perfil">
                {/* Avatar redondo; se não tiver URL, usa a inicial */}
                <Avatar className="size-7">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={displayName} />
                  ) : null}
                  <AvatarFallback>
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Nome (some em telas muito pequenas) */}
                <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
                  Perfil
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Vai para a página /perfil */}
              <DropdownMenuItem asChild>
                <Link to="/perfil">
                  <User className="mr-2 size-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              {/* Abre o popup de edição rápida */}
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <User className="mr-2 size-4" />
                Editar nome
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Área de treinos na nuvem (precisa de conta) */}
              <DropdownMenuItem asChild>
                <Link to="/treinos">
                  <CalendarDays className="mr-2 size-4" />
                  Meus treinos
                </Link>
              </DropdownMenuItem>
              {/* Sair da conta Google */}
              {conta && (
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    toast.success("Você saiu da sua conta.");
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Sair da conta
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {/* Apaga nome/avatar (mantém o id) */}
              <DropdownMenuItem onClick={limpar}>
                <LogOut className="mr-2 size-4" />
                Limpar identidade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* -------- usuário SEM nome: botão de criar -------- */
          <div className="flex items-center gap-2">
            {controls.label === "Perfil" ? (
              <Button asChild variant="ghost" className="gap-2 px-2 sm:px-4" aria-label="Perfil" title="Perfil">
                <Link to="/perfil">
                  <User className="size-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>
              </Button>
            ) : (
              <Button onClick={() => setOpen(true)} variant="ghost" className="gap-2 px-2 sm:px-4" aria-label="Criar meu perfil" title="Criar meu perfil">
                <User className="size-4" />
                <span className="hidden sm:inline">Criar meu perfil</span>
              </Button>
            )}

          </div>
        )}
        </div>
      </div>

      {/* ---------- popup de identidade (nome + avatar) ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="text-display break-words pr-8 text-3xl">Sua identidade</DialogTitle>
            <DialogDescription>
              Use até 23 letras e espaços. Seu nome fica salvo neste navegador.
            </DialogDescription>
          </DialogHeader>

          {/* Campo: nome com no máximo 23 letras e espaços */}
          <label className="block">
            <span className="text-display text-xs text-primary">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(sanitizeName(e.target.value))}
              placeholder="Ex.: Gustavo"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          {/* Só deixa salvar se tiver algum nome digitado */}
          <div className="mt-4 flex justify-end">
            <Button onClick={salvar} disabled={!nome.trim()} className="text-display">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
