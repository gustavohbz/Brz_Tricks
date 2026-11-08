import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Instagram, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSkater, instagramUrl } from "@/lib/skaters";

export const Route = createFileRoute("/skatistas/$id")({
  head: () => ({ meta: [{ title: "Perfil de skatista — Brauza Skate Co." }, { name: "description", content: "Perfil de skatista com pista que frequenta e Instagram." }, { property: "og:title", content: "Perfil de skatista — Brauza Skate Co." }, { property: "og:description", content: "Veja a pista e o Instagram deste skatista." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" }] }),
  component: SkaterPage,
});

function SkaterPage() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["skater", id], queryFn: () => getSkater(id) });
  const s = q.data;
  return <main className="mx-auto min-h-screen max-w-2xl px-4 pb-20 pt-24">
    <Button asChild variant="ghost" className="mb-6"><Link to="/skatistas"><ArrowLeft className="size-4" />Todos os skatistas</Link></Button>
    {q.isLoading ? <p>Carregando…</p> : !s ? <p>Skatista não encontrado.</p> : <article className="rounded-md border border-border bg-card p-6">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary font-display text-3xl text-primary-foreground">{s.name.charAt(0).toUpperCase()}</div>
      <h1 className="font-display text-5xl">{s.name}</h1>
      {s.bio && <p className="mt-3 whitespace-pre-line text-muted-foreground">{s.bio}</p>}
      <p className="mt-5 flex gap-2"><MapPin className="size-5 shrink-0 text-primary" /><span><span className="block text-sm text-muted-foreground">Pista que frequenta</span>{s.home_park}</span></p>
      {s.instagram && <Button asChild className="mt-6"><a href={instagramUrl(s.instagram)} target="_blank" rel="noopener noreferrer"><Instagram className="size-4" />@{s.instagram}</a></Button>}
    </article>}
  </main>;
}
