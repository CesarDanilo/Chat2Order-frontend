<div align="center">

<img src="https://github.com/user-attachments/assets/0175136b-50b2-4d23-acc1-433add1042cd" alt="Chat2Order Banner" width="100%" style="border-radius: 12px;" />

# Chat2Order — Frontend

**Interface web para realização de pedidos via chat, conectada ao Chat2Order Backend.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TanStack Router](https://img.shields.io/badge/TanStack_Router-1.x-FF4154?style=flat-square)](https://tanstack.com/router)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=flat-square)](https://ui.shadcn.com)

</div>

---

## 📖 Sobre o Projeto

O **Chat2Order Frontend** é a camada de interface do sistema Chat2Order — uma aplicação web voltada para clientes finais realizarem pedidos de forma simples e fluida, sem necessidade de canais externos.

A aplicação se comunica diretamente com o [Chat2Order Backend](https://github.com/seu-usuario/chat2order-backend), consumindo sua API REST para autenticação, gestão de pedidos e dados de usuário.

> **Contexto:** O frontend foi construído com foco em experiência do usuário final, com rotas protegidas, componentes reutilizáveis e uma arquitetura de serviços desacoplada do restante da aplicação.

---

## ✨ Funcionalidades

- 🔐 **Autenticação** — Login e controle de sessão com rotas protegidas (`_private`)
- 🛒 **Realização de Pedidos** — Interface para criação e acompanhamento de pedidos
- 📋 **Listagem de Pedidos** — Visualização dos pedidos em tabela com suporte a drawer de detalhes
- 👤 **Perfil do Usuário** — Página de perfil com dados da conta
- 🧩 **Componentes Reutilizáveis** — UI construída com shadcn/ui e Radix UI, garantindo acessibilidade e consistência
- 📱 **Layout Responsivo** — Sidebar, Header e Drawers adaptados para diferentes tamanhos de tela

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 |
| Linguagem | TypeScript 6.x |
| Build Tool | Vite 8.x |
| Estilização | Tailwind CSS 4.x |
| Componentes | shadcn/ui + Radix UI |
| Roteamento | TanStack Router 1.x + React Router DOM 7.x |
| Validação | Zod 4.x |
| Ícones | Lucide React |
| Animações | tw-animate-css + Vaul (drawers) |

---

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── assets/                  # Imagens, fontes e recursos estáticos
│   ├── components/
│   │   └── ui/                  # Componentes de interface reutilizáveis
│   │       ├── DrawerOrders.tsx  # Drawer de detalhes de pedido
│   │       ├── DrawerUsers.tsx   # Drawer de detalhes de usuário
│   │       ├── Header.tsx        # Cabeçalho da aplicação
│   │       ├── Sidebar.tsx       # Menu lateral de navegação
│   │       └── TableOrders.tsx   # Tabela de listagem de pedidos
│   ├── context/                 # Contextos globais (ex: autenticação)
│   ├── hooks/                   # Custom hooks reutilizáveis
│   ├── lib/                     # Utilitários e configurações de bibliotecas
│   ├── pages/                   # Páginas da aplicação
│   ├── routes/
│   │   ├── _private/            # Rotas autenticadas
│   │   │   ├── dashboard.tsx    # Painel principal
│   │   │   ├── orders.tsx       # Página de pedidos
│   │   │   ├── profile.tsx      # Perfil do usuário
│   │   │   └── users.tsx        # Gerenciamento de usuários
│   │   └── _public/             # Rotas públicas (login, etc.)
│   ├── services/                # Camada de comunicação com a API
│   │   ├── auth-services.ts     # Serviços de autenticação
│   │   ├── orders-services.ts   # Serviços de pedidos
│   │   └── user-services.ts     # Serviços de usuário
│   ├── index.css                # Estilos globais e variáveis Tailwind
│   ├── main.tsx                 # Entry point da aplicação
│   └── routeTree.gen.ts         # Árvore de rotas gerada pelo TanStack Router
├── public/                      # Arquivos públicos servidos estaticamente
├── .env                         # Variáveis de ambiente (desenvolvimento)
├── .env.production              # Variáveis de ambiente (produção)
├── vite.config.ts               # Configuração do Vite
├── tsconfig.app.json            # Configuração TypeScript da aplicação
└── package.json
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js 20+](https://nodejs.org)
- [Git](https://git-scm.com)
- Chat2Order Backend rodando localmente ou em produção

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/chat2order-frontend.git
cd chat2order-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com a URL base da API:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 📦 Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript e gera o bundle de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Analisa o código com ESLint |

---

## 🔗 Repositórios Relacionados

| Repositório | Descrição |
|---|---|
| [chat2order-backend](https://github.com/seu-usuario/chat2order-backend) | API REST — Node.js, TypeScript, Prisma, PostgreSQL |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit: `git commit -m 'feat: adiciona minha feature'`
4. Push: `git push origin feat/minha-feature`
5. Abra um Pull Request

> Utilize [Conventional Commits](https://www.conventionalcommits.org/pt-br/) para padronizar as mensagens.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.

---

<div align="center">

Desenvolvido com ☕ e React

</div>
