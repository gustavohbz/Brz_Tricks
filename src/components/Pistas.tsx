/* =========================================================
    Pistas — lista de pistas de skate com mapa e comentários
    ---------------------------------------------------------
    • Dados vêm da tabela `pistas` (leitura pública).
    • Filtros por nível (iniciante/intermediário/avançado) e cidade.
    • Clique no card abre um popup com mapa do Google + comentários.
    • Comentários usam a identidade local (sem login): o autor é o
      id gerado no navegador (src/lib/local-user.ts).
    ========================================================= */
import { useEffect, useMemo, useState } from "react";
import { MapPin, Ruler, Star, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleMapView } from "@/components/GoogleMapView";
import { useLocalUser } from "@/lib/local-user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ---------- tipos ---------- */

/* Níveis de dificuldade possíveis (igual ao enum do banco) */
type Nivel = "iniciante" | "intermediario" | "avancado";

/* Uma pista, com os mesmos campos da tabela `pistas` */
type Pista = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  endereco: string | null; // pode não ter endereço cadastrado
  tamanho_m2: number | null;
  piso: string | null; // ex.: "concreto liso"
  nivel: Nivel;
  descricao: string | null;
  lat: number; // coordenadas para o mapa
  lng: number;
};

/* Um comentário/avaliação deixado numa pista */
type Comentario = {
  id: string;
  user_id: string; // id da identidade local de quem comentou
  autor_nome: string | null; // cópia do nome na hora do comentário
  autor_avatar: string | null; // cópia do avatar na hora do comentário
  nota: number; // 1 a 5 estrelas
  texto: string;
  created_at: string;
};

/* Opções do filtro de nível ("todos" mostra tudo) */
const NIVEIS: { value: Nivel | "todos"; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

/* Rótulo bonito para exibir o nível vindo do banco */
const nivelLabel: Record<Nivel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

/* =========================================================
    Estrelas (nota de 1 a 5)
    ---------------------------------------------------------
    • Sem onChange: só exibe a nota (modo leitura).
    • Com onChange: vira botões clicáveis (modo formulário).
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
          /* Modo edição: cada estrela é um botão */
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`Dar nota ${n}`}
            className="text-primary"
          >
            {/* Estrelas até a nota ficam preenchidas */}
            <Star className={`size-4 ${n <= nota ? "fill-current" : ""}`} />
          </button>
        ) : (
          /* Modo leitura: só ícones, sem clique */
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
    ---------------------------------------------------------
    Mostrado dentro do popup da pista. Lê e grava na tabela
    `pista_comentarios`. Qualquer um pode comentar — o autor é
    identificado pelo id da identidade local do navegador.
    ========================================================= */
function Comentarios({ pista }: { pista: Pista }) {
  // Identidade local de quem está usando a página agora
  const { user, displayName } = useLocalUser();

  const [lista, setLista] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);

  // Campos do formulário de novo comentário
  const [texto, setTexto] = useState("");
  const [nota, setNota] = useState(5); // começa com 5 estrelas
  const [saving, setSaving] = useState(false); // trava o botão durante o envio

  /* Busca os comentários desta pista, do mais novo ao mais antigo */
  const carregar = async () => {
    const { data, error } = await supabase
      .from("pista_comentarios")
      .select("id, user_id, autor_nome, autor_avatar, nota, texto, created_at")
      .eq("pista_id", pista.id)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return; // em caso de erro, mantém a lista como está
    setLista((data ?? []) as Comentario[]);
  };

  /* Carrega os comentários sempre que trocar de pista */
  useEffect(() => {
    setLoading(true);
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pista.id]);

  /* Publica um novo comentário no banco */
  const enviar = async () => {
    const value = texto.trim();
    // Sem id local (ainda carregando), não dá para identificar o autor
    if (!user?.id) {
      toast.error("Recarregue a página para comentar.");
      return;
    }
    if (!value) return; // ignora texto vazio
    setSaving(true);
    const { error } = await supabase.from("pista_comentarios").insert({
      pista_id: pista.id,
      user_id: user.id, // dono do comentário (identidade local)
      autor_nome: displayName, // cópia do nome atual
      autor_avatar: user.avatar || null,
      nota,
      texto: value.slice(0, 1000), // limite de 1000 caracteres
    });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível enviar o comentário.");
      return;
    }
    // Limpa o formulário e recarrega a lista
    setTexto("");
    setNota(5);
    toast.success("Comentário publicado!");
    void carregar();
  };

  /* Apaga um comentário (o botão só aparece no comentário do próprio
     usuário, comparando o id local com o user_id do comentário) */
  const remover = async (id: string) => {
    const { error } = await supabase.from("pista_comentarios").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível apagar.");
      return;
    }
    // Remove da tela sem precisar recarregar tudo
    setLista((l) => l.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-6 border-t border-border pt-5">
      <p className="text-display flex items-center gap-2 text-xs text-accent">
        <MessageSquare className="size-3.5" />
        Comentários da galera
      </p>

      {/* ---------- formulário de novo comentário ---------- */}
      <div className="mt-3 rounded-md border border-border p-3">
        <>
          {/* Se o usuário ainda não escolheu nome, sugere criar o perfil */}
          {!user?.name?.trim() && (
            <p className="mb-2 text-xs text-muted-foreground">
              Dica: defina seu nome em “Criar meu perfil”, no topo da página.
            </p>
          )}
          <>
            {/* Seletor de nota (clicável) */}
            <Estrelas nota={nota} onChange={setNota} />
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, 1000))}
              placeholder="Como é a pista? Piso, movimento, dicas..."
              rows={3}
              className="mt-2 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {/* Desabilitado enquanto salva ou se o texto está vazio */}
            <Button
              onClick={enviar}
              disabled={saving || !texto.trim()}
              className="text-display mt-2"
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Publicar
            </Button>
          </>
        </>
      </div>

      {/* ---------- lista de comentários ---------- */}
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
              {/* Cabeçalho: avatar + nome + nota */}
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
              {/* Texto do comentário (mantém quebras de linha) */}
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {c.texto}
              </p>
              {/* "Apagar" só aparece no comentário do próprio usuário */}
              {user?.id === c.user_id && (
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
    Seção principal — filtros, grade de cards e popup
    ========================================================= */
export function Pistas() {
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros selecionados pelo usuário
  const [filtro, setFiltro] = useState<Nivel | "todos">("todos");
  const [cidadeFiltro, setCidadeFiltro] = useState<string>("todas");

  // Pista aberta no popup (null = popup fechado)
  const [aberta, setAberta] = useState<Pista | null>(null);

  /* Busca todas as pistas do banco uma única vez, ao montar */
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

  /* Lista de cidades únicas (ordenadas) para os botões de filtro.
     "todas" é sempre a primeira opção. */
  const cidades = useMemo(
    () => ["todas", ...Array.from(new Set(pistas.map((p) => p.cidade))).sort((a, b) => a.localeCompare(b))],
    [pistas],
  );

  /* Aplica os dois filtros (nível E cidade) sobre a lista completa */
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
      {/* Cabeçalho da seção */}
      <p className="text-display text-sm text-accent">Onde andar</p>
      <h2 className="text-display mt-2 text-4xl sm:text-5xl">Pistas</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Tamanho, piso, nível e localização no mapa. Clique numa pista para ver o mapa e
        os comentários de quem já andou lá.
      </p>

      {/* ---------- filtro por nível ---------- */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-display text-xs text-muted-foreground">Nível:</span>
        {NIVEIS.map((n) => (
          <button
            key={n.value}
            onClick={() => setFiltro(n.value)}
            aria-pressed={filtro === n.value}
            className={`text-display rounded-full border px-3 py-1 text-xs transition-colors ${
              filtro === n.value
                ? "border-primary bg-primary text-primary-foreground" // selecionado
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* ---------- filtro por cidade ---------- */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-display text-xs text-muted-foreground">Cidade:</span>
        {cidades.map((c) => (
          <button
            key={c}
            onClick={() => setCidadeFiltro(c)}
            aria-pressed={cidadeFiltro === c}
            className={`text-display rounded-full border px-3 py-1 text-xs transition-colors ${
              cidadeFiltro === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {c === "todas" ? "Todas" : c}
          </button>
        ))}
      </div>

      {/* ---------- grade de cards de pistas ---------- */}
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando pistas...</p>
      ) : visiveis.length === 0 ? (
        /* Nenhum resultado: oferece botão para limpar os filtros */
        <div className="mt-8 space-y-3">
          <p className="text-sm text-muted-foreground">
            Nenhuma pista encontrada com os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setFiltro("todos");
              setCidadeFiltro("todas");
            }}
            className="text-display rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visiveis.map((p) => (
            /* O card inteiro é um botão que abre o popup da pista */
            <button
              key={p.id}
              onClick={() => setAberta(p)}
              className="shadow-street group rounded-lg border border-border bg-card p-5 text-left transition-all hover:-translate-y-1 hover:border-primary"
            >
              <span className="text-display text-xs text-primary">
                {nivelLabel[p.nivel]}
              </span>
              <h3 className="text-display mt-1 text-2xl leading-tight">{p.nome}</h3>
              {/* Cidade e estado */}
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                {p.cidade} — {p.estado}
              </p>
              {/* Tamanho e tipo de piso (se houver) */}
              {p.tamanho_m2 ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Ruler className="size-3.5" />
                  {p.tamanho_m2.toLocaleString("pt-BR")} m²
                  {p.piso ? ` • ${p.piso}` : ""}
                </p>
              ) : null}
              {/* Descrição curta (no máximo 3 linhas) */}
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

      {/* ---------- popup da pista (mapa + detalhes + comentários) ---------- */}
      <Dialog open={!!aberta} onOpenChange={(o) => !o && setAberta(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-popover">
          {aberta && (
            <>
              {/* Cabeçalho: nível, nome e endereço */}
              <DialogHeader>
                <span className="text-display text-xs text-primary">
                  {nivelLabel[aberta.nivel]}
                </span>
                <DialogTitle className="text-display text-3xl">{aberta.nome}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {aberta.endereco ?? `${aberta.cidade} — ${aberta.estado}`}
                </DialogDescription>
              </DialogHeader>

              {/* Mapa do Google centrado nas coordenadas da pista */}
              <GoogleMapView lat={aberta.lat} lng={aberta.lng} title={aberta.nome} />

              {/* Ficha técnica: tamanho, piso, nível e cidade */}
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

              {/* Descrição completa (se houver) */}
              {aberta.descricao ? (
                <p className="mt-3 text-sm text-muted-foreground">{aberta.descricao}</p>
              ) : null}

              {/* Comentários da pista aberta */}
              <Comentarios pista={aberta} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
