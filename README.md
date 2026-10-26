# 🛹 Brz Tricks — Skate do Zero

O Brz Tricks é um guia gratuito para quem está começando no skate. Reúne instruções de manobras, um cronograma de treinos, dicas e um mapa de pistas.

## Modelo do produto

O aplicativo será **gratuito**: não haverá cobrança nem plano pago. A divulgação será feita por um banner que levará ao grupo do projeto no WhatsApp.

O convite do grupo ainda precisa ser configurado no código. O conteúdo do banner está centralizado em `src/data/site-messages.ts`, no objeto `advertisingBanner`. Quando o link estiver disponível, use a URL de convite do grupo no campo `href` e ajuste o texto de chamada.

O cronograma funciona gratuitamente no navegador, mesmo sem login. Com Google, o cronograma e o setup também podem ser salvos na conta, sem assinatura ou prazo de teste. O banner atualmente leva à área de treinos.

## O que o aplicativo oferece

- Guia com 30 manobras, organizadas em Ollies, Variais e Flips.
- Instruções passo a passo, vídeos e pré-requisitos para aprender cada manobra.
- Cronograma semanal de treino.
- Dicas sobre segurança, técnica, equipamento e mentalidade.
- Mapa de pistas de skate, com informações e avaliações.
- Perfil local para visitantes e entrada com Google para recursos associados à conta.

## Como a aplicação funciona

A interface é feita em React e TypeScript. O TanStack Start organiza as páginas e as funções executadas no servidor. O Supabase fornece autenticação e banco de dados; o Google Maps exibe a localização das pistas.

Alguns dados ficam apenas no navegador, usando `localStorage`. Outros podem ser salvos na conta do Supabase para serem acessados em diferentes aparelhos. As manobras são conteúdo mantido no próprio código, em vez de registros editáveis no banco.

```text
Navegador
  ├── Páginas React e componentes
  ├── Conteúdo das manobras em src/data/tricks.ts
  ├── Dados locais em localStorage
  └── Funções de servidor TanStack
          └── Supabase: autenticação e banco de dados
                  └── Google Maps: mapa das pistas
```

### Tecnologias

- **Interface:** React 19 e TypeScript
- **Rotas e funções de servidor:** TanStack Start e TanStack Router
- **Cache de consultas:** TanStack Query
- **Estilos e componentes:** Tailwind CSS, Radix UI e componentes shadcn
- **Build e desenvolvimento:** Vite
- **Autenticação e banco:** Supabase
- **Login Google:** integração de autenticação do Lovable
- **Mapa:** Google Maps JavaScript API

## Estrutura do repositório

| Caminho | O que contém |
| --- | --- |
| `src/routes/` | Páginas: início, entrada, perfil e treinos |
| `src/components/` | Componentes do produto, como cronograma, pistas, dicas e cabeçalho |
| `src/components/ui/` | Componentes visuais reutilizáveis |
| `src/data/tricks.ts` | Manobras, passos e roadmaps |
| `src/data/site-messages.ts` | Conteúdo do banner e notificações |
| `src/lib/` | Regras de negócio, autenticação local, dados do perfil e funções de conta |
| `src/integrations/` | Clientes e integrações com Supabase e Lovable |
| `supabase/migrations/` | Histórico de criação e alteração das tabelas e regras de acesso |
| `public/` | Ícones e arquivos públicos do site |
| `src/routeTree.gen.ts` | Árvore de rotas gerada automaticamente; não editar manualmente |

### Dados no Supabase

- `profiles`: perfil, configuração do skate e cronograma da conta.
- `pistas`: pistas e suas informações geográficas.
- `pista_comentarios`: avaliações e comentários associados a uma pista.

A estrutura histórica de assinaturas está aposentada e não participa do cadastro nem do salvamento. Ela permanece apenas por compatibilidade com o histórico de alterações; não há integração de pagamentos ativa no aplicativo.

As regras de acesso ao banco ficam nas migrations. Não altere uma tabela diretamente no painel sem também registrar a mudança em uma migration.

## Executar localmente

### Pré-requisitos

- Node.js e npm
- Git
- Variáveis de ambiente válidas para os serviços Supabase/Lovable usados pelo projeto
- Chave do Google Maps configurada para exibir os mapas

### Passos

1. Clone o repositório:

   ```bash
   git clone https://github.com/gustavohbz/Brz_Tricks.git
   cd Brz_Tricks
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Abra o endereço indicado no terminal, normalmente `http://localhost:5173`.

Comandos adicionais:

```bash
npm run lint
npm run build
```

## Lovable e GitHub

O repositório está conectado ao Lovable. Alterações feitas na plataforma podem ser sincronizadas para o GitHub, e commits enviados à branch conectada podem aparecer no Lovable. Evite reescrever o histórico já publicado (por exemplo, com force push ou rebase de commits publicados).

## Onde começar a ler o código

1. `src/data/tricks.ts`: conteúdo e tipos das manobras.
2. `src/routes/index.tsx`: página inicial e apresentação do guia.
3. `src/components/Cronograma.tsx`: criação do cronograma semanal.
4. `src/components/Pistas.tsx`: consulta de pistas, mapa e comentários.
5. `src/lib/account.functions.ts`: leitura da conta e salvamento gratuito do cronograma e setup.
6. `supabase/migrations/`: estrutura do banco e permissões.
