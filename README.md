# 🛹 Skate Trick Guide - Landing Page

Uma landing page interativa desenvolvida para auxiliar skatistas iniciantes no aprendizado de manobras de skate. O projeto é construído com **React**, **TypeScript** e ecossistema **TanStack**, integrado e sincronizado com o **Lovable**.

---

## 📌 Visão Geral

Aplicação SPA (*Single Page Application*) focada em guiar o usuário desde a recepção até o estudo detalhado de manobras divididas por três categorias principais: **Ollies**, **Variais** e **Flips**. 

Cada categoria possui **10 cards interativos** que abrem modais informativos detalhando a execução da manobra.

---

## 🛠️ Tech Stack

- **Core:** React 18+ com TypeScript
- **Roteamento / Estado:** TanStack Router / TanStack Query
- **Estilização:** Tailwind CSS
- **Build Tool:** Vite
- **Plataforma / Sync:** Lovable + GitHub

---

## 🚀 Arquitetura e Fluxo de Componentes

```text
       [ HeroWelcome ] ──> Seletor "Iniciante"
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
[ Seção Ollies ]       [ Seção Variais ]      [ Seção Flips ]
  (10 Cards)             (10 Cards)             (10 Cards)
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              ▼
                       [ TrickModal ]
```

### Componentes Principais

- `<HeroWelcome />`: Apresentação inicial e seletor de nível.
- `<CategoryNav />`: Navegação rápida entre as categorias (Ollies, Variais, Flips).
- `<TrickGrid />`: Renderiza a grade de 10 botões/cards da categoria ativa.
- `<TrickModal />`: Modal genérico e tipado para exibir detalhes e dicas da manobra selecionada.

---

## 🔄 Sincronização Lovable x GitHub

Este projeto está sincronizado de forma bidirecional com a plataforma **Lovable**:
- Alterações feitas na interface do Lovable são enviadas automaticamente para este repositório.
- Qualquer alteração enviada via `git push` no GitHub é refletida de volta na plataforma Lovable.

---

## 💻 Como Executar o Projeto Localmente (VS Code)

### Pré-requisitos
* **Node.js** e **npm** (gerenciados via [nvm](https://github.com/nvm-sh/nvm))
* **Git** instalado na máquina

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/gustavohbz/Brz_Tricks
   ```

2. **Acesse a pasta do projeto:**
   ```bash
   cd skate-landing-page
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. Acesse no navegador o endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## ⚡ Edição Rápida sem Instalação (VS Code Web)

Para ajustes rápidos diretamente no navegador sem clonar o repositório:

1. Abra a página principal deste repositório no GitHub.
2. Pressione a tecla **`.`** (ponto) no teclado para abrir o **VS Code para Web**.
3. Faça as alterações necessárias e envie o commit diretamente pela aba *Source Control*.

> **Nota:** O VS Code Web permite editar arquivos diretamente no repositório, mas não roda o servidor local (`npm run dev`).
