import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Instagram, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/use-auth";
import { cleanInstagram, cleanText, listSkaters, saveSkater } from "@/lib/skaters";

export const Route = createFileRoute("/skatistas/")({
  head: () => ({ meta: [{ title: "Skatistas — Brauza Skate Co." }, { name: "description", content: "Conheça skatistas, a pista que frequentam e o Instagram de cada um." }, { property: "og:title", content: "Skatistas — Brauza Skate Co." }, { property: "og:description", content: "Perfis de skatistas com pista e Instagram." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Skatistas,
});

function Skatistas() {
  const { user, loading } = useAuth();
  const q = useQuery({ queryKey: ["skaters"], queryFn: listSkaters });
  const mine = q.data?.find(s => s.user_id === user?.id);
  const [form, setForm] = useState({ name: "", bio: "", home_park: "", instagram: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (mine) setForm({ name: mine.name, bio: mine.bio, home_park: mine.home_park, instagram: mine.instagram }); }, [mine]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!user) return;
    if (form.name.trim().length < 2 || form.home_park.trim().length < 2) return toast.error("Preencha nome e pista.");
    setBusy(true);
    try { await saveSkater(user.id, form); toast.success("Perfil de skatista salvo!"); await q.refetch(); }
    catch { toast.error("Não foi possível salvar."); } finally { setBusy(false); }
  }

  return <main className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-24">
    <div className="border-b border-border pb-6"><p className="text-sm text-primary">Brauza Skate Co.</p><h1 className="font-display text-5xl sm:text-6xl">Skatistas</h1><p className="mt-2 text-muted-foreground">Encontre quem anda na sua pista e siga no Instagram.</p></div>

    <section className="my-8 rounded-md border border-border bg-card p-5">
      <h2 className="mb-4 text-2xl font-semibold">{mine ? "Seu perfil de skatista" : "Crie seu perfil de skatista"}</h2>
      {user ? <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">Nome<Input required maxLength={60} value={form.name} onChange={e => setForm({ ...form, name: cleanText(e.target.value, 60) })} /></label>
        <label className="grid gap-1 text-sm">Pista que frequenta<Input required maxLength={100} placeholder="Ex.: Pista do Ibirapuera" value={form.home_park} onChange={e => setForm({ ...form, home_park: cleanText(e.target.value, 100) })} /></label>
        <label className="grid gap-1 text-sm">Instagram<Input maxLength={30} placeholder="@seuusuario" value={form.instagram} onChange={e => setForm({ ...form, instagram: cleanInstagram(e.target.value) })} /></label>
        <label className="grid gap-1 text-sm sm:col-span-2">Sobre você<Textarea maxLength={300} value={form.bio} onChange={e => setForm({ ...form, bio: cleanText(e.target.value, 300) })} /></label>
        <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar perfil"}</Button>{mine && <Button asChild variant="outline"><Link to="/skatistas/$id" params={{ id: mine.id }}>Ver meu perfil</Link></Button>}</div>
      </form> : <Button asChild disabled={loading}><Link to="/entrar">Entrar para criar seu perfil</Link></Button>}
    </section>

    {q.isLoading ? <p>Carregando…</p> : q.data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{q.data.map(s => <Link key={s.id} to="/skatistas/$id" params={{ id: s.id }} className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-primary">
      <h3 className="text-xl font-semibold">{s.name}</h3>
      <p className="mt-2 flex gap-2 text-sm"><MapPin className="size-4 shrink-0 text-primary" />{s.home_park}</p>
      {s.instagram && <p className="mt-1 flex gap-2 text-sm text-muted-foreground"><Instagram className="size-4 shrink-0" />@{s.instagram}</p>}
    </Link>)}</div> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center"><Users className="size-10 text-primary" /><p>Ainda não há skatistas cadastrados.</p></div>}
  </main>;
}
