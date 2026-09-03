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
import { LogOut, User } from "lucide-react";
import { useLocalUser } from "@/lib/local-user";
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

export function SiteHeader() {
  // Identidade local reativa (id + nome + avatar)
  const { user, update, displayName } = useLocalUser();

  // Controla se o popup de edição está aberto
  const [open, setOpen] = useState(false);

  // Campos do formulário do popup (editáveis antes de salvar)
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");

  // Quando a identidade carregar (ou mudar), preenche o formulário
  // com os valores atuais para o usuário editar em cima deles.
  useEffect(() => {
    if (!user) return;
    setNome(user.name);
    setAvatar(user.avatar);
  }, [user]);

  // Salva nome/avatar digitados na identidade local e fecha o popup
  const salvar = () => {
    update({ name: nome.trim(), avatar: avatar.trim() });
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
        <a href="#top" className="text-display text-lg tracking-wide">
          Skate <span className="text-primary">do Zero</span>
        </a>

        {temNome ? (
          /* -------- usuário COM nome: menu suspenso -------- */
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
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
                  {displayName}
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
                Editar nome e avatar
              </DropdownMenuItem>
              {/* Apaga nome/avatar (mantém o id) */}
              <DropdownMenuItem onClick={limpar}>
                <LogOut className="mr-2 size-4" />
                Limpar identidade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* -------- usuário SEM nome: botão de criar -------- */
          <Button onClick={() => setOpen(true)} variant="secondary" className="gap-2">
            <User className="size-4" />
            Criar meu perfil
          </Button>
        )}
      </div>

      {/* ---------- popup de identidade (nome + avatar) ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="text-display text-3xl">Sua identidade</DialogTitle>
            <DialogDescription>
              Só um nome e um avatar, guardados neste navegador. Sem senha, sem e-mail.
            </DialogDescription>
          </DialogHeader>

          {/* Campo: nome de exibição (limite de 40 caracteres) */}
          <label className="block">
            <span className="text-display text-xs text-primary">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 40))}
              placeholder="Ex.: Gustavo"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          {/* Campo: URL da imagem de avatar (limite de 500 caracteres) */}
          <label className="mt-2 block">
            <span className="text-display text-xs text-primary">Avatar (URL)</span>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value.slice(0, 500))}
              placeholder="https://..."
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          {/* Prévia do avatar + botão salvar */}
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="size-10">
              {avatar ? <AvatarImage src={avatar} alt="Prévia do avatar" /> : null}
              <AvatarFallback>
                {(nome.trim() || "S").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Só deixa salvar se tiver algum nome digitado */}
            <Button onClick={salvar} disabled={!nome.trim()} className="text-display">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
