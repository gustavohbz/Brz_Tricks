# Guia técnico do projeto

Este documento explica como o BRZ Tricks está organizado, como os dados percorrem a aplicação e onde começar ao fazer uma alteração. Ele descreve o código da branch principal; PRs ainda não mesclados podem acrescentar mudanças.

## Visão geral

O BRZ Tricks é uma aplicação web gratuita para skatistas. O conteúdo das manobras é mantido no código. A aplicação também oferece treinos, perfil, dicas, feedback e recursos de pistas. A interface usa React e TypeScript; TanStack Start cuida das rotas e funções no servidor. Supabase fornece autenticação e banco de dados, e Google Maps mostra localizações.

```text
Navegador
├── React: páginas, componentes e interações
├── Conteúdo estático: manobras, vídeos e textos do site
├── Armazenamento local: identidade local, preferências e dados sem conta
└── Funções TanStack executadas no servidor
    └── Supabase: autenticação e dados da conta, com RLS
        └── Google Maps JavaScript API: mapa carregado quando necessário
```

Não é uma aplicação PHP. O código principal é TypeScript/React e o servidor é executado com Node/Bun e TanStack Start.

## Rotas

As rotas são definidas por arquivos em `src/routes/`. O arquivo `src/routeTree.gen.ts` é gerado pelo TanStack Router e não deve ser editado à mão.

| URL | Arquivo | Finalidade |
| --- | --- | --- |
| `/` | `src/routes/index.tsx` | Página inicial, trilha de aprendizagem e seções principais |
| `/entrar` | `src/routes/entrar.tsx` | Entrada com Google |
| `/perfil` | `src/routes/perfil.tsx` | Perfil, setup e acesso aos dados da conta |
| `/treinos` | `src/routes/treinos.tsx` | Cronograma de treinos |
| `/marketplace` | `src/routes/marketplace.tsx` | Área do marketplace |
| `/skatistas` | `src/routes/skatistas.index.tsx` | Lista de skatistas |
| `/skatistas/:id` | `src/routes/skatistas.$id.tsx` | Perfil público de skatista |

A estrutura visual comum, os metadados, a tela 404 e a página de erro ficam em `src/routes/__root.tsx`.

## Mapa do código

| Pasta/arquivo | Responsabilidade |
| --- | --- |
| `src/routes/` | Páginas e configurações de rota |
| `src/components/` | Componentes do produto, como cabeçalho, treinos, pistas e feedback |
| `src/components/ui/` | Componentes de interface reutilizáveis, baseados em Radix e shadcn |
| `src/data/tricks.ts` | Dados das manobras, instruções e pré-requisitos |
| `src/data/trick-categories.ts` | Categorias e nomes exibidos na trilha |
| `src/data/videos.ts` | Lista de vídeos recomendados |
| `src/data/site-messages.ts` | Texto do banner e anúncios/notificações |
| `src/lib/` | Validações, armazenamento local, autenticação e regras de negócio |
| `src/integrations/supabase/` | Clientes Supabase, autenticação e tipos do banco |
| `src/integrations/lovable/` | Integração com recursos do Lovable |
| `src/styles.css` | Tokens de cores, fontes e estilos globais |
| `src/router.tsx` | Criação do router e do cache TanStack Query |
| `src/start.ts`, `src/server.ts` | Configuração e entrada do servidor |
| `supabase/migrations/` | Histórico versionado de tabelas, funções, índices e políticas |
| `supabase/manual/` | SQL documentado para operações manuais específicas |
| `tests/` e arquivos `*.test.ts` | Testes unitários e de interface |
| `public/` | Ícones e outros arquivos publicados diretamente |

Arquivos gerados — especialmente `src/routeTree.gen.ts` e `src/integrations/supabase/types.ts` — não devem ser tratados como fonte primária. Altere a rota ou o schema/migration correspondente e regenere os arquivos conforme o fluxo do projeto.

## Dados e persistência

| Dado | Onde fica | Observações |
| --- | --- | --- |
| Manobras, categorias e vídeos recomendados | Código em `src/data/` | Não são editados no banco durante o uso normal |
| Identidade local | `localStorage` do navegador | Não equivale a uma conta autenticada |
| Preferências e estado de notificações locais | `localStorage` | Não é uma caixa de mensagens privada |
| Setup de quem usa sem conta | Navegador | Os campos passam por uma lista permitida de caracteres |
| Perfil, setup e cronograma de uma conta | Tabela `profiles` | Funções de servidor exigem sessão Supabase |
| Pistas | Tabela `pistas` | Nome, endereço e coordenadas precisam ser confirmados antes de publicação |
| Comentários e avaliações de pistas | Tabela `pista_comentarios` | A leitura é pública; gravações são protegidas por autenticação e políticas |
| Feedback anônimo | Tabela `feedback` | Texto validado na interface e novamente no banco; limites também são aplicados no envio |

A identidade guardada no navegador e a identidade da conta Google são conceitos separados. Para operações da conta, a autorização vem da sessão validada no servidor, não do nome salvo localmente.

### Tabelas do Supabase

O schema atual inclui `profiles`, `pistas`, `pista_comentarios`, `feedback`, `products`, `skaters`, `user_roles` e estruturas legadas de assinatura. Nem toda tabela é usada nas telas principais. Assinaturas não são requisito para salvar o perfil ou o cronograma. Antes de remover uma estrutura antiga, confira suas referências no código e nas migrations.

As regras de leitura e escrita devem ser protegidas por Row Level Security (RLS). Não use a chave de service role no navegador: ela ignora RLS.

## Fluxos principais

### Manobras

`src/data/tricks.ts` é a fonte principal dos textos, passos, níveis e pré-requisitos. A interface percorre esses dados e monta cards, detalhes e roadmaps. Para adicionar uma manobra, atualize os dados e os testes correspondentes; não duplique o texto dentro de um componente.

### Cronograma e perfil

A pessoa pode organizar treinos no navegador. Ao entrar com Google, funções como `getMyAccount`, `saveMyPlan` e `saveMySetup` em `src/lib/account.functions.ts` leem e gravam os dados associados à própria conta. O middleware `requireSupabaseAuth` valida o token antes da execução.

### Pistas e mapas

`src/components/Pistas.tsx` consulta os registros do Supabase e apresenta os cartões, filtros, avaliações e comentários. `src/components/GoogleMapView.tsx` carrega a API do Google Maps sob demanda. Uma chave de navegador é visível no cliente por definição; restrinja-a no Google Cloud aos domínios autorizados e à API necessária. Não coloque uma chave secreta em uma variável `VITE_*`.

Os dados geográficos precisam ser revisados por uma pessoa antes de serem considerados corretos. Coordenadas e descrições de exemplo não são prova de que um local existe.

### Feedback

`src/lib/feedback.ts` concentra a validação e a sanitização do texto. `src/components/Feedback.tsx` aplica o limite de envios por sessão no navegador e envia o texto à tabela `feedback`. As migrations aplicam as proteções do lado do banco; a regra do navegador, sozinha, não é uma barreira de segurança.

## Configuração local

### Requisitos

- Git
- Bun para dependências, scripts e testes
- Node.js em versão compatível com as ferramentas do projeto, se o ambiente local exigir
- Acesso às variáveis do projeto Lovable/Supabase para testar fluxos conectados
- Uma chave Google Maps configurada para ver mapas interativos

### Iniciar

```bash
git clone https://github.com/gustavohbz/Brz_Tricks.git
cd Brz_Tricks
bun install
bun run dev
```

Abra o endereço informado no terminal (normalmente `http://localhost:5173`). Se essa porta estiver ocupada, o Vite escolhe outra e informa a URL correta.

Outros comandos disponíveis:

```bash
bun run build
bun run preview
bun run lint
bun run test
bun run test:e2e
bun run test:all
```

O Playwright pode precisar do navegador Chromium na primeira execução:

```bash
bunx playwright install chromium
```

O arquivo `playwright.config.ts` define projetos para desktop, tablet, celular, largura móvel estreita e celular em paisagem. A presença desses projetos não significa que os testes passaram; confira o resultado da execução atual.

### Variáveis de ambiente

Em desenvolvimento local, crie um arquivo `.env` local e obtenha os valores nos painéis autorizados do Lovable/Supabase/Google Cloud. Nunca envie valores secretos em commits, issues ou mensagens.

| Variável | Uso |
| --- | --- |
| `VITE_SUPABASE_URL` | URL do Supabase usada no navegador |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publicável do Supabase usada no navegador |
| `SUPABASE_URL` | URL usada nas funções do servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publicável usada no servidor para chamadas com sessão/RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privilegiada, somente no servidor e em operações estritamente necessárias |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` | Chave do Maps JavaScript API para navegador |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` | Canal opcional de acompanhamento da API Maps |
| `LOVABLE_DB_MIGRATION_URL` | Conexão usada pelo Drizzle em tarefas de migration |

As variáveis `VITE_*` são incorporadas ao bundle público. Nunca coloque nelas senhas, service-role keys ou outras credenciais secretas. Em ambientes Lovable Cloud, configure variáveis pelo painel próprio da plataforma.

## Banco de dados e migrations

As migrations em `supabase/migrations/` são o histórico de alterações do schema e das políticas. Uma mudança no banco deve ser registrada em uma migration e aplicada ao ambiente correto pelo fluxo autorizado do projeto. Não presuma que criar o arquivo executou a migration remotamente.

Depois de mudar o schema, atualize/regenere os tipos do Supabase pelo fluxo de geração da plataforma e confira os usos no TypeScript. Não edite manualmente `src/integrations/supabase/types.ts` como substituto da migration.

`supabase/manual/feedback_setup.sql` é um roteiro manual específico; leia o conteúdo e confirme o estado do banco antes de executá-lo.

## Segurança e manutenção

- Valide entradas no servidor e no banco, além de na interface.
- Mantenha políticas RLS para limitar dados de cada conta ao seu proprietário.
- Use service role somente em código de servidor confiável.
- Preserve as chaves existentes de `localStorage` em refatorações, para não apagar dados locais das pessoas.
- Não invente endereços, coordenadas, fontes, preços ou destinos de campanhas.
- Restrinja a chave de Maps por HTTP referrer e API no Google Cloud; confirme cotas e faturamento no painel da conta.
- Não edite arquivos gerados como `src/routeTree.gen.ts`.
- O projeto é conectado ao Lovable. Evite reescrever histórico já publicado com force-push, rebase ou squash de commits publicados.

## Onde começar

1. Leia `src/data/tricks.ts` para entender o conteúdo de manobras.
2. Veja `src/routes/index.tsx` para a página inicial.
3. Siga `src/routes/treinos.tsx` e `src/components/Cronograma.tsx` para o fluxo de treinos.
4. Leia `src/lib/account.functions.ts` e `src/integrations/supabase/auth-middleware.ts` para salvamento autenticado.
5. Consulte `src/components/Pistas.tsx`, `src/components/GoogleMapView.tsx` e as migrations para a área de pistas.
6. Consulte `package.json` para comandos e `playwright.config.ts` para os navegadores de teste.
