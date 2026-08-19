# 📘 Documentação do Código — Brz Tricks / Skate do Zero

Guia de leitura do projeto: o que cada arquivo faz, o que cada hook faz e como as
partes se conectam. Feito para você abrir no VS Code e se localizar rápido.

---

## 1. Mapa de arquivos

```text
src/
├── data/
│   └── tricks.ts        → TODO o conteúdo (30 manobras + roadmaps). Zero UI aqui.
├── routes/
│   ├── __root.tsx       → "casca" do app: <html>, <head>, fontes, PWA, erros, 404
│   ├── index.tsx        → a landing page inteira (/) — welcome, trilha, seções, popups
│   └── routeTree.gen.ts → GERADO automaticamente. Nunca editar.
├── components/ui/       → componentes shadcn/ui (Button, Dialog, HoverCard...)
├── lib/                 → utilitários (cn, captura/relatório de erros)
├── styles.css           → design system: cores, fontes, utilitários custom
├── router.tsx           → cria o router + o QueryClient
├── start.ts             → middlewares de servidor (erro + CSRF)
└── server.ts            → entrada do servidor (SSR)
public/
└── manifest.webmanifest → configuração do PWA (nome, ícone, tela cheia)
```

---

## 2. `src/data/tricks.ts` — a fonte de verdade

Nenhum texto de manobra fica escrito dentro de componentes. Tudo vem daqui.

| Export | O que é | Usado em |
| --- | --- | --- |
| `type Trick` | uma manobra: `name`, `level`, `desc`, `steps[]`, `video?` | tipagem geral |
| `type Section` | uma família: `id`, `title`, `tagline`, `tricks[]` | tipagem geral |
| `sections` | array com as 3 famílias (Ollies, Variais, Flip's), 10 manobras cada | `index.tsx` |
| `roadmaps` | mapa `nome da manobra → lista de pré-requisitos` | `getRoadmap` |
| `getRoadmap(name)` | devolve os pré-requisitos ou `[]` se não existir | modal do roadmap |

**Como adicionar uma manobra:** inclua um objeto em `tricks` da seção desejada e,
opcionalmente, uma entrada em `roadmaps` com o mesmo `name`. A UI se atualiza sozinha
(ela faz `.map()` nos dados).

**Como adicionar vídeo:** preencha `video: "/videos/kickflip.mp4"` (arquivo em `public/`)
ou uma URL `.mp4`/`.webm`. O hover e o modal passam a mostrar o vídeo automaticamente;
sem `video`, aparece o placeholder "Vídeo em breve".

---

## 3. `src/routes/index.tsx` — a página

Dividido em blocos comentados na ordem: IMPORTS → ROUTE/SEO → componentes auxiliares → página.

### `Route = createFileRoute("/")`
Registra a página na URL `/`. O `head()` define título e metatags (SEO / preview em
redes sociais). O arquivo é a rota: `index.tsx` = `/`, `about.tsx` seria `/about`.

### `TrickHoverPreview({ trick })`
Conteúdo do popup que aparece **ao passar o mouse**. Duas partes: área de vídeo
(`<video autoPlay muted loop>` ou placeholder) e o texto (nível, nome, descrição).

### `TrickRoadmap({ name })`
Linha do tempo vertical de pré-requisitos. Chama `getRoadmap(name)`; se vier vazio,
retorna `null` (não renderiza nada). O último ponto fica destacado — é a manobra alvo.

### `Index()` — o componente da página

Estado e funções:

| Nome | Tipo | Papel |
| --- | --- | --- |
| `started` | `useState<boolean>` | `false` = só o welcome aparece. Vira `true` no clique em "Sou iniciante" e libera trilha + seções + footer. |
| `trick` | `useState<Trick \| null>` | manobra selecionada. `null` = modal fechado; qualquer objeto = modal aberto com aquela manobra. |
| `go(id)` | função | `document.getElementById(id).scrollIntoView({ behavior: "smooth" })` — rolagem suave até uma seção. |

Fluxo de interação:

```text
[Sou iniciante] → setStarted(true) → setTimeout(60ms) → go("trilha")
       (o timeout existe para o React renderizar a seção antes de rolar até ela)

[card da trilha] → go("ollies" | "variais" | "flips")

[botão de manobra] ── hover ─→ HoverCard abre TrickHoverPreview (vídeo)
                    └ clique ─→ setTrick(t) → Dialog abre: passos + TrickRoadmap
```

Seções na página, na ordem: **1 Welcome** (hero) → **2 Trilha** (3 botões) →
**3 Manobras** (uma `<section>` por família, gerada com `sections.map`) → **Footer** →
**Modal** (fica fora do fluxo, aberto por estado).

---

## 4. Hooks usados (e o que cada um faz)

| Hook | Onde | Para quê |
| --- | --- | --- |
| `useState` | `index.tsx` | guarda `started` e `trick`. Trocar o estado re-renderiza a tela. |
| `useEffect` | `__root.tsx` | dispara o relatório de erro quando o `ErrorComponent` monta. |
| `useRouter` | `__root.tsx` | dá acesso ao router para `invalidate()` no botão "Try again". |
| `Route.useRouteContext` | `__root.tsx` | pega o `queryClient` criado em `router.tsx`. |

Não há hooks customizados próprios do projeto ainda. `src/hooks/use-mobile.tsx` vem do
shadcn e detecta largura de tela (não usado na landing atual).

Regras de hooks: só podem ser chamados no topo de um componente/hook, nunca dentro de
`if`, loop ou função aninhada.

---

## 5. Componentes shadcn/ui usados

- **`Button`** — botão estilizado com variantes (`size="lg"`).
- **`Dialog`** (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`) —
  modal controlado por `open={!!trick}` e `onOpenChange`.
- **`HoverCard`** (`HoverCardTrigger asChild`, `HoverCardContent`) — popup de hover;
  `openDelay`/`closeDelay` evitam abrir/fechar num piscar de olhos.
  `asChild` faz o trigger usar o `<button>` da manobra em vez de criar outra tag.

---

## 6. Estilo (`src/styles.css`)

Tailwind v4 configurado por CSS (sem `tailwind.config.js`). Cores vivem como tokens
semânticos — use sempre os tokens, nunca `text-white`/`bg-[#fff]`:

`background`, `foreground`, `card`, `popover`, `primary` (amarelo ácido), `accent`,
`secondary`, `muted-foreground`, `border`.

Utilitários custom do projeto:

| Classe | Efeito |
| --- | --- |
| `text-display` | fonte Bebas Neue + caixa alta (títulos) |
| `surface-asphalt` | fundo texturizado de asfalto do hero |
| `shadow-street` | sombra dura, estilo street |
| `ring-glow` | brilho ao redor do CTA principal |

Fontes entram via `<link>` no `head` de `__root.tsx` (Bebas Neue + Barlow).

---

## 7. Arquivos de infraestrutura (raramente mexidos)

- **`__root.tsx`** — `<html>/<head>/<body>`, metatags globais, manifest do PWA,
  `NotFoundComponent` (404) e `ErrorComponent` (tela de erro), e o `<Outlet />`
  onde as rotas são renderizadas. Remover o `<Outlet />` quebra tudo.
- **`router.tsx`** — instancia o router e o `QueryClient` (cache de dados).
- **`start.ts`** — middlewares do servidor: captura de erro e proteção CSRF.
- **`server.ts`** — entrada SSR; converte erros feios em página de erro amigável.
- **`routeTree.gen.ts`** — gerado pelo plugin do Vite. **Não editar.**

---

## 8. Receitas rápidas

| Quero... | Onde mexer |
| --- | --- |
| mudar texto de manobra | `src/data/tricks.ts` |
| adicionar vídeo | campo `video` em `src/data/tricks.ts` |
| mudar pré-requisitos | `roadmaps` em `src/data/tricks.ts` |
| mudar cores/fonte | `src/styles.css` |
| mudar textos do hero | seção 1 em `src/routes/index.tsx` |
| criar nova página `/sobre` | criar `src/routes/sobre.tsx` com `createFileRoute("/sobre")` |
| mudar nome/ícone do app instalável | `public/manifest.webmanifest` |

---

## 9. Guia de Sobrevivência: Mentalidade PHP para TS & React

Mudar da execução linear do PHP no servidor para o modelo reativo do React exige remapear a forma como os dados, as rotas e a interface interagem.

**Tabela de Equivalências Diretas**

| Conceito no PHP | Equivalente no Projeto | Papel na Prática |
| :--- | :--- | :--- |
| `routes/web.php` / Controllers | `src/routes/index.tsx` | A URL `/` carrega direto este arquivo via TanStack Router. |
| `layout.blade.php` | `src/routes/__root.tsx` | A estrutura base. O `<Outlet />` funciona como o `@yield('content')`. |
| Model / Array de Mock | `src/data/tricks.ts` | Fonte de dados estática que simula retornos de banco de dados. |
| `$_SESSION` ou Estado da View | `useState()` | Dados em memória no navegador. Alterar um estado atualiza a tela sem F5. |
| `foreach ($items as $item)` | `items.map(item => ...)` | Método do JS para iterar arrays e devolver blocos de HTML (JSX). |
| DTO / Type Hinting | `type Trick` / `type Section` | Contratos rígidos do TS para o editor apontar erros antes do build. |

**Ciclo de Vida: Servidor vs Navegador**

* **PHP Clássico:** O usuário clica $\rightarrow$ Requisição HTTP completa $\rightarrow$ Servidor executa o script do zero $\rightarrow$ Retorna HTML novo $\rightarrow$ Navegador dá F5 na página.
* **Esta Aplicação:** O Node executa um SSR (Server-Side Rendering) inicial para entregar o HTML com SEO. Em seguida, o JavaScript assume no navegador. Qualquer clique posterior (como abrir manobra ou filtrar) apenas altera variáveis na memória local e o React substitui os elementos do DOM sem recarregar a página.

**Diferenças Chave de Arquitetura**

* **Lógica e HTML Unificados:** No React, controllers e views vivem no mesmo arquivo. O componente `Index()` processa estados (`started`, `trick`) e retorna a marcação visual no final.
* **Interações Sem Requisição AJAX:** Abrir o modal não consulta nenhum endpoint `/trick?id=X`. O comando `setTrick(t)` pega o objeto `Trick` que já está no navegador e o passa para o `<Dialog>`.
* **Tipagem Estática vs Runtime:** O PHP valida tipos na execução. O TypeScript valida enquanto você digita no VS Code. Se tentar acessar `trick.categoria` e essa propriedade não existir na `type Trick`, a aplicação nem compila.
* **Manipulação de Variáveis na Tela:** No PHP, você altera uma variável com `$x = 10` e renderiza. No React, você **nunca** faz `started = true`. Deve-se usar a função atualizadora `setStarted(true)` para forçar o React a desenhar a alteração na tela.
