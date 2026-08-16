# AutoControl — Oficina Mecânica e Funilaria

Sistema web completo de gestão para oficinas mecânicas e de funilaria/pintura: controle de
clientes, veículos, ordens de serviço, orçamentos, peças, fotos e um **acompanhamento público
do cliente** — sem necessidade de login — acessível por link exclusivo ou QR Code.

Projeto desenvolvido como **Projeto Integrador da UNIVESP**.

---

## Sumário

- [Objetivo e problema resolvido](#objetivo-e-problema-resolvido)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Banco de dados](#banco-de-dados)
- [API REST](#api-rest)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação e configuração](#instalação-e-configuração)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Executando o backend](#executando-o-backend)
- [Executando o frontend](#executando-o-frontend)
- [Migrations e seed](#migrations-e-seed)
- [Usuário de demonstração](#usuário-de-demonstração)
- [Testes automatizados](#testes-automatizados)
- [Build de produção](#build-de-produção)
- [Deploy](#deploy)
- [Requisitos do Projeto Integrador UNIVESP](#requisitos-do-projeto-integrador-univesp)
- [Melhorias futuras](#melhorias-futuras)

---

## Objetivo e problema resolvido

Oficinas mecânicas e de funilaria pequenas e médias costumam controlar ordens de serviço em
papel, planilhas ou aplicativos de mensagens, o que gera perda de informação, dificuldade de
acompanhar o status dos veículos e falta de transparência com o cliente. O **AutoControl**
centraliza esse fluxo: da entrada do veículo até a entrega, com histórico completo, orçamento
calculado automaticamente e uma página pública para que o cliente acompanhe o andamento do
próprio veículo em tempo real, sem precisar criar conta ou ligar para a oficina.

## Funcionalidades

- Autenticação com **JWT** e três perfis de acesso (Administrador, Atendente, Mecânico), cada
  um com permissões distintas.
- CRUD completo de **clientes**, com preenchimento automático de endereço via **ViaCEP**.
- CRUD completo de **veículos**, vinculados a clientes (um cliente pode ter vários veículos).
- **Ordens de serviço** com status (diagnóstico, aguardando aprovação, manutenção, funilaria,
  pintura, teste, pronto, entregue, cancelado), diagnóstico, previsão de entrega e observações.
- **Linha do tempo (timeline)** de cada ordem de serviço, com todo o histórico de mudanças de
  status, usuário responsável e data/hora.
- Catálogo de **serviços** e **peças**, com estoque e valores.
- **Cálculo automático de orçamento** (serviços + peças + mão de obra = total), com registro de
  pagamentos parciais e saldo restante.
- **Upload de fotos** do veículo (entrada, durante o serviço, finalização) via **Cloudinary**.
- **Página pública de acompanhamento** (`/acompanhar/:token`) — sem login — com status, timeline,
  fotos, serviços, peças e valores, escondendo informações internas da oficina.
- **QR Code** gerado automaticamente para cada ordem de serviço, com botão de download.
- Botão de **atualização via WhatsApp** com mensagem pronta para o cliente.
- **Dashboard** com indicadores e gráficos (faturamento mensal, OS por status, serviços mais
  realizados) e lista de próximas entregas.
- **Relatórios** com filtros por período/status e indicadores (faturamento, ticket médio, tempo
  médio de serviço, veículos atendidos, novos clientes).
- Interface **responsiva**, com **acessibilidade** (labels, foco visível, aria-labels, status
  nunca indicado só por cor) e **PWA** instalável.

## Tecnologias

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Lucide React, Recharts,
Axios, vite-plugin-pwa, Vitest + React Testing Library.

**Backend:** Node.js, Express, TypeScript, Prisma ORM, JWT (jsonwebtoken), bcrypt, Zod, Helmet,
express-rate-limit, Multer, Cloudinary SDK, QRCode, Vitest + Supertest.

**Banco de dados:** MySQL 8.

**Armazenamento de imagens:** Cloudinary (o MySQL guarda apenas URL, `public_id`, categoria e
referência da ordem de serviço).

**Hospedagem planejada:** Frontend no Netlify, backend no Render, MySQL em um serviço de nuvem
compatível (ex.: Railway, PlanetScale/Aiven, Clever Cloud).

## Arquitetura

```text
┌────────────────┐      HTTPS / REST      ┌──────────────────┐      Prisma      ┌──────────┐
│   Frontend      │ ─────────────────────▶ │   Backend API     │ ───────────────▶ │  MySQL   │
│ React + Vite    │ ◀───────────────────── │ Express + TS      │ ◀─────────────── │          │
│ (Netlify)       │        JSON            │ (Render)          │                  └──────────┘
└────────────────┘                        └──────────────────┘
        │                                          │
        │                                          ▼
        │                                  ┌──────────────────┐
        │                                  │    Cloudinary     │
        │                                  │ (fotos dos OS)    │
        │                                  └──────────────────┘
        ▼
┌────────────────┐
│   ViaCEP (API   │
│   externa)      │
└────────────────┘
```

O frontend nunca acessa o banco diretamente: toda persistência passa pela API REST do backend,
que valida (Zod), autentica (JWT) e autoriza (por perfil) cada requisição antes de falar com o
MySQL via Prisma.

## Banco de dados

Modelagem principal (veja o schema completo em [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)):

```text
Client
  └── Vehicle (1:N)
        └── WorkOrder (1:N)
              ├── WorkOrderService (N:N com Service)
              ├── WorkOrderPart (N:N com Part)
              ├── WorkOrderPhoto (metadados — arquivo no Cloudinary)
              ├── Payment (1:N)
              └── WorkOrderStatusHistory (1:N — timeline)

User (funcionários) ── responsável por mudanças de status e fotos
```

Todas as tabelas usam UUID como chave primária, timestamps de criação/atualização, foreign keys
com integridade referencial e índices nos campos mais consultados (placa, CPF, status, token
público).

## API REST

Principais rotas (prefixo `/api`), documentadas por completo no código-fonte:

```text
POST   /api/auth/login
GET    /api/auth/me

GET    /api/clientes            POST /api/clientes
GET    /api/clientes/:id        PUT  /api/clientes/:id     DELETE /api/clientes/:id

GET    /api/veiculos            POST /api/veiculos
GET    /api/veiculos/:id        PUT  /api/veiculos/:id     DELETE /api/veiculos/:id

GET    /api/servicos            POST /api/servicos         ...
GET    /api/pecas               POST /api/pecas            ...

GET    /api/ordens              POST /api/ordens
GET    /api/ordens/:id          PUT  /api/ordens/:id       DELETE /api/ordens/:id
POST   /api/ordens/:id/status
POST   /api/ordens/:id/servicos            DELETE /api/ordens/:id/servicos/:itemId
POST   /api/ordens/:id/pecas               DELETE /api/ordens/:id/pecas/:itemId
POST   /api/ordens/:id/pagamentos
POST   /api/ordens/:id/fotos               DELETE /api/ordens/:id/fotos/:photoId
GET    /api/ordens/:id/qrcode

GET    /api/acompanhar/:token   (pública — sem autenticação)

GET    /api/dashboard
GET    /api/relatorios

GET    /api/usuarios            POST /api/usuarios         (somente admin)
```

Todas as rotas administrativas exigem `Authorization: Bearer <token>` (JWT). A rota pública de
acompanhamento usa apenas o token da OS e retorna somente dados que podem ser exibidos ao
cliente (sem observações internas, sem dados de outros clientes).

## Estrutura do projeto

```text
autocontrol/
├── frontend/            React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/  Componentes reutilizáveis (ui/, layout/, workorder/, forms/)
│   │   ├── pages/        Páginas/rotas
│   │   ├── layouts/      Layout autenticado (sidebar + topbar)
│   │   ├── services/     Chamadas à API (axios) e à API externa ViaCEP
│   │   ├── hooks/        useAuth, useToast
│   │   ├── contexts/     AuthContext, ToastContext
│   │   ├── types/        Tipos TypeScript compartilhados
│   │   └── utils/        Formatação, labels de status, paleta de gráficos
│   └── public/           manifest.json, ícones do PWA
│
├── backend/              Node.js + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/  Regras de negócio por recurso
│   │   ├── routes/       Definição das rotas REST
│   │   ├── middlewares/  Autenticação, autorização, upload, tratamento de erros
│   │   ├── validators/   Schemas Zod
│   │   └── utils/        Prisma client, cálculo de orçamento, Cloudinary, JWT
│   ├── prisma/           schema.prisma e seed.ts
│   └── tests/            Testes de integração (Vitest + Supertest)
│
├── docker-compose.yml    MySQL local para desenvolvimento
└── README.md
```

## Instalação e configuração

Pré-requisitos: **Node.js 18+**, **npm**, e um **MySQL** acessível (local, Docker ou nuvem).

```bash
git clone <url-do-repositorio>
cd autocontrol

# Backend
cd backend
npm install
cp .env.example .env   # preencha DATABASE_URL, JWT_SECRET e, opcionalmente, Cloudinary

# Frontend
cd ../frontend
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
```

### Banco de dados local com Docker (recomendado)

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe um MySQL 8 em `localhost:3306` com usuário/senha `autocontrol` (já configurado no
`.env.example` do backend). Se preferir usar um MySQL já instalado ou um serviço em nuvem, basta
ajustar `DATABASE_URL` no `.env` do backend.

## Variáveis de ambiente

**`backend/.env`** (veja `backend/.env.example`):

```text
DATABASE_URL="mysql://autocontrol:autocontrol@localhost:3306/autocontrol"
JWT_SECRET="troque-por-um-segredo-forte-aqui"
JWT_EXPIRES_IN="8h"
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=3333
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

O upload de fotos só funciona com credenciais Cloudinary válidas (gratuitas em
[cloudinary.com](https://cloudinary.com)); o restante do sistema funciona normalmente sem elas.

**`frontend/.env`** (veja `frontend/.env.example`):

```text
VITE_API_URL=http://localhost:3333/api
```

Nenhum segredo é commitado no repositório — apenas os arquivos `.env.example`.

## Executando o backend

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate     # cria as tabelas no MySQL
npm run seed                # popula dados de demonstração
npm run dev                  # inicia a API em http://localhost:3333
```

## Executando o frontend

```bash
cd frontend
npm run dev                  # inicia em http://localhost:5173
```

Com backend e frontend rodando, acesse `http://localhost:5173/login`.

## Migrations e seed

```bash
cd backend
npm run prisma:migrate       # aplica as migrations (ambiente de desenvolvimento)
npm run prisma:deploy        # aplica migrations em produção
npm run prisma:studio        # abre o Prisma Studio para inspecionar o banco
npm run seed                  # popula usuários, clientes, veículos, serviços, peças e OS fictícios
```

## Usuário de demonstração

O `seed` cria os seguintes usuários (senha **123456** para todos):

| Perfil         | E-mail                          |
|----------------|----------------------------------|
| Administrador  | `admin@autocontrol.com.br`       |
| Atendente      | `atendente@autocontrol.com.br`   |
| Mecânico       | `mecanico@autocontrol.com.br`    |

Também são criados 10 clientes, 15 veículos, 10 serviços, 15 peças e 18 ordens de serviço em
diferentes status, com timeline e pagamentos — todos com dados fictícios.

## Testes automatizados

**Backend** (Vitest + Supertest — requer banco de dados migrado e populado):

```bash
cd backend
npm run seed   # necessário: os testes autenticam com os usuários de demonstração
npm test
```

Cobrem: login/autenticação, permissões por perfil, CRUD de clientes e veículos, criação de OS,
inclusão de serviços/peças, cálculo de valores, pagamentos, atualização de status e consulta
pública por token.

**Frontend** (Vitest + React Testing Library):

```bash
cd frontend
npm test
```

Cobrem: login, cadastro de cliente (incluindo integração com ViaCEP), cadastro de veículo,
criação de ordem de serviço, cálculo/exibição de orçamento, atualização de status, exibição da
timeline e a página pública de acompanhamento.

## Build de produção

```bash
# Backend
cd backend
npm run build      # gera backend/dist
npm start           # roda o build (node dist/server.js)

# Frontend
cd frontend
npm run build       # type-check + build gera frontend/dist
npm run preview     # serve o build localmente para conferência
```

## Deploy

- **Frontend (Netlify):** publique a pasta `frontend`, comando de build `npm run build`,
  diretório de publicação `dist`, e configure `VITE_API_URL` apontando para a URL do backend no
  Render.
- **Backend (Render):** Web Service Node, comando de build `npm install && npm run build &&
  npx prisma migrate deploy`, comando de start `npm start`, e configure as variáveis de ambiente
  do `.env.example` (incluindo `DATABASE_URL` do MySQL em nuvem e `FRONTEND_URL` apontando para
  o domínio do Netlify).
- **Banco de dados:** qualquer serviço MySQL gerenciado compatível (Railway, PlanetScale, Aiven,
  Clever Cloud, etc.), com a `DATABASE_URL` apontada nas variáveis de ambiente do backend.
- **Imagens:** conta gratuita no Cloudinary.

## Requisitos do Projeto Integrador UNIVESP

| Requisito                  | Onde é atendido |
|-----------------------------|------------------|
| **Framework web**            | React (frontend) + Express (backend), com roteamento em ambos (React Router / Express Router). |
| **Banco de dados**           | MySQL, modelado e acessado via Prisma ORM (`backend/prisma/schema.prisma`), com relacionamentos, índices e constraints. |
| **JavaScript / TypeScript**  | Todo o projeto (frontend e backend) é escrito em TypeScript com tipagem estrita. |
| **Computação em nuvem**      | Deploy planejado: frontend no Netlify, backend no Render, banco em serviço MySQL gerenciado, imagens no Cloudinary. |
| **Uso de API externa**       | Integração com a **API ViaCEP** para preenchimento automático de endereço a partir do CEP (`frontend/src/services/cepService.ts`), com tratamento de CEP inválido, não encontrado e indisponibilidade. |
| **Acessibilidade**           | HTML semântico, labels em todos os campos, `aria-label`/`aria-describedby`, foco visível, navegação por teclado, contraste adequado, status sempre com ícone + texto (nunca só cor), alvos de toque ≥44px. |
| **Controle de versão**       | Git, com histórico de commits incrementais documentando a evolução do projeto (ver `git log`). |
| **Testes automatizados**     | Backend: Vitest + Supertest (`backend/tests/`). Frontend: Vitest + React Testing Library (arquivos `*.test.ts(x)` em `frontend/src/`). |
| **Análise de dados**         | Dashboard e página de Relatórios com indicadores (faturamento, ticket médio, tempo médio de serviço) e gráficos (Recharts): faturamento mensal, OS por status, serviços mais realizados. |

## Melhorias futuras

- Notificações automáticas por e-mail/WhatsApp (API oficial) quando o status da OS muda.
- Assinatura digital do cliente na aprovação do orçamento.
- Controle de estoque com baixa automática de peças ao vincular à OS.
- App mobile nativo para os mecânicos (atualmente coberto pelo PWA responsivo).
- Relatórios exportáveis em PDF/Excel.
- Múltiplas oficinas (multi-tenant) para redes de franquias.
