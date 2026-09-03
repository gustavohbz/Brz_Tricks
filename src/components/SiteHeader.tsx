/* =========================================================
   SiteHeader — cabeçalho fixo com identidade local
   ---------------------------------------------------------
   • Sem login externo: um id é gerado no navegador.
   • O usuário escolhe apenas nome e avatar (URL da imagem).
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
  const { user, update, displayName } = useLocalUser();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!user) return;
    setNome(user.name);
    setAvatar(user.avatar);
  }, [user]);

  const salvar = () => {
    update({ name: nome.trim(), avatar: avatar.trim() });
    setOpen(false);
    toast.success("Identidade salva neste navegador!");
  };

  const limpar = () => {
    update({ name: "", avatar: "" });
    toast.success("Nome e avatar removidos.");
  };

  const temNome = !!user?.name?.trim();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="#top" className="text-display text-lg tracking-wide">
          Skate <span className="text-primary">do Zero</span>
        </a>

        {temNome ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-7">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={displayName} />
                  ) : null}
                  <AvatarFallback>
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm sm:inline">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/perfil">
                  <User className="mr-2 size-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <User className="mr-2 size-4" />
                Editar nome e avatar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={limpar}>
                <LogOut className="mr-2 size-4" />
                Limpar identidade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={() => setOpen(true)} variant="secondary" className="gap-2">
            <User className="size-4" />
            Criar meu perfil
          </Button>
        )}
      </div>

      {/* ---------- popup de identidade ---------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-popover">
          <DialogHeader>
            <DialogTitle className="text-display text-3xl">Sua identidade</DialogTitle>
            <DialogDescription>
              Só um nome e um avatar, guardados neste navegador. Sem senha, sem e-mail.
            </DialogDescription>
          </DialogHeader>

          <label className="block">
            <span className="text-display text-xs text-primary">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value.slice(0, 40))}
              placeholder="Ex.: Gustavo"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="mt-2 block">
            <span className="text-display text-xs text-primary">Avatar (URL)</span>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value.slice(0, 500))}
              placeholder="https://..."
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>

          <div className="mt-4 flex items-center gap-3">
            <Avatar className="size-10">
              {avatar ? <AvatarImage src={avatar} alt="Prévia do avatar" /> : null}
              <AvatarFallback>
                {(nome.trim() || "S").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button onClick={salvar} disabled={!nome.trim()} className="text-display">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
