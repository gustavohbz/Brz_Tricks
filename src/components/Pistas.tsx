/* =========================================================
   Pistas — lista de pistas de skate com mapa e comentários
   ---------------------------------------------------------
   • Dados vêm da tabela `pistas` (leitura pública).
   • Filtro por nível: iniciante / intermediário / avançado.
   • Clique no card abre o popup com mapa do Google + comentários.
   • Comentar exige login (RLS: cada um só mexe no próprio).
   ========================================================= */
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { MapPin, Ruler, Star, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleMapView } from "@/components/GoogleMapView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ---------- tipos ---------- */
type Nivel = "iniciante" | "intermediario" | "avancado";

type Pista = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  endereco: string | null;
  tamanho_m2: number | null;
  piso: string | null;
  nivel: Nivel;
  descricao: string | null;
  lat: number;
  lng: number;
};

type Comentario = {
  id: string;
  user_id: string;
  autor_nome: string | null;
  autor_avatar: string | null;
  nota: number;
  texto: string;
  created_at: string;
};

const NIVEIS: { value: Nivel | "todos"; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

const nivelLabel: Record<Nivel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

/* =========================================================
   Estrelas (nota de 1 a 5)
   ========================================================= */
function Estrelas({
  nota,
  onChange,
}: {
  nota: number;
  onChange?: ((n: number) => void) | undefined;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Dar nota ${n}`}
            className="text-primary"
          >
            <Star className={`size-4 ${n <= nota ? "fill-current" : ""}`} />
          </button>
        ) : (
          <Star
            key={n}
            className={`size-3.5 text-primary ${n <= nota ? "fill-current" : ""}`}
          />
        ),
      )}
    </div>
  );
}

/* =========================================================
   Comentários de uma pista
   ========================================================= */
function Comentarios({ pista, session }: { pista: Pista; session: Session | null }) {
  const [lista, setLista] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [nota, setNota] = useState(5);
  const [saving, setSaving] = useState(false);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("pista_comentarios")
      .select("id, user_id, autor_nome, autor_avatar, nota, texto, created_at")
      .eq("pista_id", pista.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return;
    setLista((data ?? []) as Comentario[]);
  };

  useEffect(() => {
    setLoading(true);
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pista.id]);

  const enviar = async () => {
    const value = texto.trim();
    if (!session?.user) {
      toast.error("Entre com o Google para comentar.");
      return;
    }
    if (!value) return;
    setSaving(true);
    const meta = session.user.user_metadata as Record<string, unknown>;
    const { error } = await supabase.from("pista_comentarios").insert({
      pista_id: pista.id,
      user_id: session.user.id,
      autor_nome:
        (meta["full_name"] as string | undefined) ?? session.user.email ?? "Skater",
      autor_avatar: (meta["avatar_url"] as string | undefined) ?? null,
      nota,
      texto: value.slice(0, 1000),
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível enviar o comentário.");
      return;
    }
    setTexto("");
    setNota(5);
    toast.success("Comentário publicado!");
    void carregar();
  };

  const remover = async (id: string) => {
    const { error } = await supabase.from("pista_comentarios").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível apagar.");
      return;
    }
    setLista((l) => l.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-display flex items-center gap-2 text-xs text-accent">
        <MessageSquare className="size-3.5" />
        Comentários da galera
      </p>

      {/* ---------- formulário ---------- */}
      <div className="mt-3 rounded-md border border-border p-3">
        {session?.user ? (
          <>
            <Estrelas nota={nota} onChange={setNota} />
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, 1000))}
              placeholder="Como é a pista? Piso, movimento, dicas..."
              rows={3}
              className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <Button
              onClick={enviar}
              disabled={saving || !texto.trim()}
              className="text-display mt-2"
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Publicar
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Entre com o Google no topo da página para comentar nesta pista.
          </p>
        )}
      </div>

      {/* ---------- lista ---------- */}
      {loading ? (
        <p className="mt-4 text-xs text-muted-foreground">Carregando comentários...</p>
      ) : lista.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Ninguém comentou ainda. Seja o primeiro!
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {lista.map((c) => (
            <li key={c.id} className="rounded-md border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                {c.autor_avatar ? (
                  <img
                    src={c.autor_avatar}
                    alt={c.autor_nome ?? "Skater"}
                    className="size-6 rounded-full"
                    loading="lazy"
                  />
                ) : null}
                <span className="text-sm">{c.autor_nome ?? "Skater"}</span>
                <Estrelas nota={c.nota} />
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {c.texto}
              </p>
              {session?.user?.id === c.user_id && (
                <button
                  onClick={() => remover(c.id)}
                  className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary"
                >
                  Apagar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================
   Seção principal
   ========================================================= */
export function Pistas() {
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<Nivel | "todos">("todos");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>("todas");
  const [aberta, setAberta] = useState<Pista | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase
      .from("pistas")
      .select("*")
      .order("cidade", { ascending: true })
      .then(({ data }) => {
        setPistas((data ?? []) as Pista[]);
        setLoading(false);
      });
  }, []);

  const cidades = useMemo(
    () => ["todas", ...Array.from(new Set(pistas.map((p) => p.cidade))).sort((a, b) => a.localeCompare(b))],
    [pistas],
  );

  const visiveis = useMemo(
    () =>
      pistas.filter((p) => {
        const nivelOk = filtro === "todos" || p.nivel === filtro;
        const cidadeOk = cidadeFiltro === "todas" || p.cidade === cidadeFiltro;
        return nivelOk && cidadeOk;
      }),
    [pistas, filtro, cidadeFiltro],
  );

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-display text-sm text-accent">Onde andar</p>
      <h2 className="text-display mt-2 text-4xl sm:text-5xl">Pistas</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Tamanho, piso, nível e localização no mapa. Clique numa pista para ver o mapa e
        os comentários de quem já andou lá.
      </p>

      {/* ---------- filtros de nível ---------- */}
      <div className="mt-6 flex flex-wrap gap-2">
        {NIVEIS.map((n) => (
          <button
            key={n.value}
            onClick={() => setFiltro(n.value)}
            aria-pressed={filtro === n.value}
            className={`text-display rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filtro === n.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* ---------- grade de pistas ---------- */}
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando pistas...</p>
      ) : visiveis.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Nenhuma pista nesse nível por enquanto.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p) => (
            <button
              key={p.id}
              onClick={() => setAberta(p)}
              className="shadow-street group rounded-lg border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary"
            >
              <span className="text-display text-xs text-primary">
                {nivelLabel[p.nivel]}
              </span>
              <h3 className="text-display mt-1 text-2xl leading-tight">{p.nome}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {p.cidade} — {p.estado}
              </p>
              {p.tamanho_m2 ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ruler className="size-3.5" />
                  {p.tamanho_m2.toLocaleString("pt-BR")} m²
                  {p.piso ? ` • ${p.piso}` : ""}
                </p>
              ) : null}
              {p.descricao ? (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {p.descricao}
                </p>
              ) : null}
              <span className="text-display mt-4 inline-block text-xs text-accent transition-colors group-hover:text-primary">
                Ver mapa e comentários →
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---------- popup da pista ---------- */}
      <Dialog open={!!aberta} onOpenChange={(o) => !o && setAberta(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-popover">
          {aberta && (
            <>
              <DialogHeader>
                <span className="text-display text-xs text-primary">
                  {nivelLabel[aberta.nivel]}
                </span>
                <DialogTitle className="text-display text-3xl">{aberta.nome}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {aberta.endereco ?? `${aberta.cidade} — ${aberta.estado}`}
                </DialogDescription>
              </DialogHeader>

              {/* mapa */}
              <GoogleMapView lat={aberta.lat} lng={aberta.lng} title={aberta.nome} />

              {/* infos */}
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Tamanho
                  </dt>
                  <dd>
                    {aberta.tamanho_m2
                      ? `${aberta.tamanho_m2.toLocaleString("pt-BR")} m²`
                      : "Não informado"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Piso
                  </dt>
                  <dd>{aberta.piso ?? "Não informado"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Nível
                  </dt>
                  <dd>{nivelLabel[aberta.nivel]}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Cidade
                  </dt>
                  <dd>
                    {aberta.cidade} — {aberta.estado}
                  </dd>
                </div>
              </dl>

              {aberta.descricao ? (
                <p className="mt-3 text-sm text-muted-foreground">{aberta.descricao}</p>
              ) : null}

              {/* comentários */}
              <Comentarios pista={aberta} session={session} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
