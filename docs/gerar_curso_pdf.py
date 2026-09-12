# -*- coding: utf-8 -*-
"""Gera o curso 'Do zero ao Sangalli Gestão' em PDF, usando fpdf2.
Conteúdo baseado no código real do projeto (backend Express/Prisma + frontend
React/Vite), organizado como um curso passo a passo para quem nunca construiu
uma aplicação full-stack."""

from fpdf import FPDF

FONT_DIR = "C:/Windows/Fonts/"

NAVY = (30, 41, 59)
GREEN = (22, 101, 52)
GREY_BG = (243, 244, 246)
NOTE_BG = (239, 246, 255)
NOTE_BORDER = (59, 130, 246)
LINE_GREY = (209, 213, 219)
TEXT_GREY = (75, 85, 99)


class Course(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.add_font("Arial", "", FONT_DIR + "arial.ttf")
        self.add_font("Arial", "B", FONT_DIR + "arialbd.ttf")
        self.add_font("Arial", "I", FONT_DIR + "ariali.ttf")
        self.add_font("Consolas", "", FONT_DIR + "consola.ttf")
        self.add_font("Consolas", "B", FONT_DIR + "consolab.ttf")
        self.set_auto_page_break(auto=True, margin=20)
        self.set_margins(20, 18, 20)
        self.module_no = 0
        self.show_header_footer = False

    def header(self):
        if not self.show_header_footer:
            return
        self.set_font("Arial", "", 8)
        self.set_text_color(*TEXT_GREY)
        self.set_y(8)
        self.cell(0, 5, "Do zero ao Sangalli Gestao - curso passo a passo", align="L")
        self.ln()
        self.set_draw_color(*LINE_GREY)
        self.line(20, 14, 190, 14)

    def footer(self):
        if not self.show_header_footer:
            return
        self.set_y(-15)
        self.set_font("Arial", "", 8)
        self.set_text_color(*TEXT_GREY)
        self.cell(0, 10, f"{self.page_no()}", align="C")

    # ---------- building blocks ----------

    def cover(self):
        self.show_header_footer = False
        self.add_page()
        self.set_fill_color(*NAVY)
        self.rect(0, 0, 210, 297, style="F")
        self.set_text_color(255, 255, 255)
        self.set_font("Arial", "B", 15)
        self.set_xy(20, 60)
        self.cell(170, 8, "CURSO PRATICO", align="L")
        self.set_xy(20, 72)
        self.set_font("Arial", "B", 30)
        self.multi_cell(170, 13, "Do zero ao Sangalli Gestao", align="L")
        self.set_xy(20, self.get_y() + 4)
        self.set_font("Arial", "", 15)
        self.multi_cell(
            170, 8,
            "Como construir, na pratica, o sistema web de gestao da Oficina "
            "Funilaria Sangalli - do primeiro arquivo ao deploy em producao.",
            align="L",
        )
        self.set_xy(20, 250)
        self.set_font("Arial", "", 11)
        self.set_text_color(203, 213, 225)
        self.multi_cell(
            170, 6,
            "Stack: React + TypeScript + Tailwind (frontend)  |  Node.js + Express + "
            "Prisma (backend)  |  PostgreSQL / Supabase (banco de dados)\n"
            "Baseado no codigo real do projeto AutoControl / Sangalli Gestao - 2026.",
        )
        self.show_header_footer = True

    def toc(self, items):
        self.add_page()
        self.set_text_color(*NAVY)
        self.set_font("Arial", "B", 20)
        self.cell(0, 12, "Sumario do curso", ln=1)
        self.ln(2)
        self.set_font("Arial", "", 11)
        self.set_text_color(30, 30, 30)
        for n, title in items:
            self.set_font("Arial", "B", 11)
            self.set_text_color(*NAVY)
            self.cell(14, 8, f"{n}.", align="L")
            self.set_font("Arial", "", 11)
            self.set_text_color(30, 30, 30)
            self.cell(0, 8, title, ln=1)
        self.ln(4)
        self.set_font("Arial", "I", 10)
        self.set_text_color(*TEXT_GREY)
        self.multi_cell(
            0, 6,
            "Como usar este material: cada modulo pode ser seguido na ordem, "
            "digitando e rodando os trechos de codigo no seu proprio computador. "
            "Os exemplos usam exatamente os nomes de arquivos e trechos de codigo "
            "do projeto Sangalli Gestao, para que voce possa comparar com o "
            "repositorio real a qualquer momento.",
        )

    def module(self, number, title, subtitle=""):
        self.module_no = number
        self.add_page()
        self.set_fill_color(*NAVY)
        self.rect(0, 0, 210, 30, style="F")
        self.set_text_color(255, 255, 255)
        self.set_xy(20, 8)
        self.set_font("Arial", "", 11)
        self.cell(0, 6, f"MODULO {number}", ln=1)
        self.set_x(20)
        self.set_font("Arial", "B", 16)
        self.multi_cell(170, 8, title)
        if subtitle:
            self.set_x(20)
            self.set_font("Arial", "I", 10)
            self.multi_cell(170, 5, subtitle)
        self.set_y(36)
        self.set_text_color(20, 20, 20)

    def section(self, text):
        self.ln(3)
        self.set_x(self.l_margin)
        self.set_font("Arial", "B", 13)
        self.set_text_color(*NAVY)
        self.multi_cell(self.epw, 7, text)
        self.set_text_color(20, 20, 20)
        self.ln(1)

    def p(self, text):
        self.set_x(self.l_margin)
        self.set_font("Arial", "", 10.5)
        self.set_text_color(20, 20, 20)
        self.multi_cell(self.epw, 5.6, text)
        self.ln(1.5)

    def bullets(self, items):
        self.set_font("Arial", "", 10.5)
        for item in items:
            self.set_x(self.l_margin)
            y0 = self.get_y()
            self.set_font("Arial", "B", 10.5)
            self.cell(5, 5.6, "-")
            self.set_font("Arial", "", 10.5)
            self.set_xy(self.l_margin + 5, y0)
            self.multi_cell(self.epw - 5, 5.6, item)
        self.ln(1.5)

    def steps(self, items):
        """items: list of (title, body)"""
        for i, (title, body) in enumerate(items, start=1):
            self.set_x(self.l_margin)
            self.set_font("Arial", "B", 10.5)
            self.set_text_color(*GREEN)
            self.multi_cell(self.epw, 6, f"Passo {i} - {title}")
            self.set_text_color(20, 20, 20)
            self.set_font("Arial", "", 10.5)
            self.set_x(self.l_margin)
            self.multi_cell(self.epw, 5.6, body)
            self.ln(2)

    def code(self, text, filename=None):
        self.ln(1)
        self.set_x(self.l_margin)
        if filename:
            self.set_font("Consolas", "B", 8.5)
            self.set_text_color(*TEXT_GREY)
            self.multi_cell(self.epw, 5, filename)
            self.set_x(self.l_margin)
        self.set_font("Consolas", "", 8.7)
        self.set_text_color(17, 24, 39)
        self.set_fill_color(*GREY_BG)
        content = text.strip("\n")
        self.multi_cell(self.epw, 4.6, content, fill=True)
        self.set_text_color(20, 20, 20)
        self.ln(2)

    def note(self, text, label="Nota"):
        self.ln(1)
        self.set_x(self.l_margin)
        self.set_font("Arial", "B", 9.5)
        self.set_text_color(*NOTE_BORDER)
        self.set_fill_color(*NOTE_BG)
        self.multi_cell(self.epw, 5, label.upper(), fill=True)
        self.set_x(self.l_margin)
        self.set_font("Arial", "", 9.5)
        self.set_text_color(30, 41, 59)
        self.multi_cell(self.epw, 5.2, text, fill=True)
        self.ln(2)

    def command(self, text):
        self.set_x(self.l_margin)
        self.set_font("Consolas", "", 9)
        self.set_fill_color(17, 24, 39)
        self.set_text_color(134, 239, 172)
        self.multi_cell(self.epw, 5.2, text.strip("\n"), fill=True)
        self.set_text_color(20, 20, 20)
        self.ln(2)

    def table(self, headers, rows, widths=None):
        self.ln(1)
        self.set_font("Arial", "B", 9.5)
        self.set_fill_color(*NAVY)
        self.set_text_color(255, 255, 255)
        if not widths:
            widths = [170 / len(headers)] * len(headers)
        for h, w in zip(headers, widths):
            self.cell(w, 7, h, border=1, fill=True)
        self.ln()
        self.set_font("Arial", "", 9)
        self.set_text_color(20, 20, 20)
        fill = False
        for row in rows:
            self.set_fill_color(*(GREY_BG if fill else (255, 255, 255)))
            max_lines = 1
            for cell_text, w in zip(row, widths):
                max_lines = max(max_lines, len(str(cell_text)) // 42 + 1)
            row_h = 5.2 * max_lines
            y0 = self.get_y()
            x0 = self.get_x()
            for cell_text, w in zip(row, widths):
                x_before = self.get_x()
                y_before = self.get_y()
                self.multi_cell(w, row_h / max_lines, str(cell_text), border=1, fill=True)
                self.set_xy(x_before + w, y_before)
            self.set_xy(x0, y0 + row_h)
            fill = not fill
        self.ln(2)


# =========================================================================
course = Course()
course.cover()

course.toc([
    (1, "Visao geral: o que vamos construir"),
    (2, "Preparando o ambiente de desenvolvimento"),
    (3, "Criando o backend do zero (Node + Express + TypeScript)"),
    (4, "Modelando o banco de dados com Prisma"),
    (5, "Organizando a API em camadas"),
    (6, "Autenticacao com JWT"),
    (7, "Construindo o primeiro CRUD: Clientes"),
    (8, "Tratamento de erros centralizado"),
    (9, "Repetindo o padrao para os demais recursos"),
    (10, "Funcionalidades especiais do backend"),
    (11, "Seguranca da API"),
    (12, "Testes automatizados"),
    (13, "Criando o frontend do zero (React + Vite + Tailwind)"),
    (14, "Consumindo a API no frontend"),
    (15, "Construindo as telas do sistema"),
    (16, "Transformando em PWA"),
    (17, "Publicando em producao (deploy)"),
    (18, "Recapitulando o que voce aprendeu"),
])

# ------------------------------------------------------------------ MODULO 1
course.module(1, "Visao geral: o que vamos construir",
              "Antes de escrever a primeira linha de codigo, entenda o mapa completo.")
course.p(
    "O Sangalli Gestao e um sistema web para uma oficina de funilaria e mecanica: ele "
    "substitui anotacoes em papel por cadastro de clientes e veiculos, ordens de "
    "servico com status (do diagnostico ate a entrega), orcamento automatico e uma "
    "pagina publica onde o cliente acompanha o proprio veiculo sem precisar de login."
)
course.section("A arquitetura em 3 camadas")
course.p(
    "Todo sistema web como este e dividido em tres partes que conversam entre si "
    "por HTTP (a mesma linguagem que seu navegador usa para abrir qualquer site):"
)
course.table(
    ["Camada", "O que e", "Tecnologia usada aqui"],
    [
        ["Frontend", "O que o usuario ve e clica, roda no navegador", "React + TypeScript + Tailwind CSS"],
        ["Backend (API)", "Recebe pedidos, aplica regras, fala com o banco", "Node.js + Express + Prisma"],
        ["Banco de dados", "Onde os dados ficam guardados de verdade", "PostgreSQL (hospedado no Supabase)"],
    ],
    widths=[35, 75, 60],
)
course.p(
    "O frontend nunca fala direto com o banco de dados - ele sempre passa pelo "
    "backend, que decide o que e permitido fazer. Essa separacao e o motivo pelo "
    "qual vamos construir dois projetos distintos (uma pasta backend/ e uma pasta "
    "frontend/), cada um com seu proprio package.json."
)
course.note(
    "Ao longo do curso voce vai literalmente recriar a estrutura de pastas do "
    "projeto real. Sempre que aparecer um caminho como backend/src/routes/clientRoutes.ts, "
    "e o arquivo correspondente do repositorio Sangalli Gestao.",
    label="Como usar este curso",
)

# ------------------------------------------------------------------ MODULO 2
course.module(2, "Preparando o ambiente de desenvolvimento")
course.section("O que instalar antes de comecar")
course.steps([
    ("Instalar o Node.js (versao 20 ou superior)",
     "E o motor que executa JavaScript/TypeScript fora do navegador - tanto o "
     "backend quanto as ferramentas do frontend (Vite) rodam sobre ele. Baixe em "
     "nodejs.org e confirme a instalacao com 'node -v' no terminal."),
    ("Instalar o Git",
     "Ferramenta de controle de versao: grava o historico de mudancas do codigo "
     "e permite subir o projeto para o GitHub."),
    ("Criar uma conta no GitHub",
     "E onde o repositorio remoto do projeto vai morar, permitindo colaboracao "
     "entre os integrantes do grupo."),
    ("Criar um projeto no Supabase",
     "O Supabase fornece um banco PostgreSQL gratuito na nuvem, sem precisar "
     "instalar banco de dados na sua maquina. No painel, voce vai encontrar a "
     "string de conexao (DATABASE_URL) que o Prisma vai usar."),
    ("Instalar um editor de codigo",
     "O projeto real foi desenvolvido no Visual Studio Code, com extensoes de "
     "ESLint e Prisma para facilitar a leitura do codigo."),
])
course.command(
    "node -v\n"
    "npm -v\n"
    "git --version"
)
course.p(
    "Se os tres comandos acima responderem com um numero de versao (e nao um "
    "erro de 'comando nao encontrado'), o ambiente esta pronto."
)

# ------------------------------------------------------------------ MODULO 3
course.module(3, "Criando o backend do zero",
              "A primeira pasta do projeto: backend/, com Node.js, Express e TypeScript.")
course.steps([
    ("Criar a pasta e iniciar o projeto Node",
     "Dentro da pasta raiz do projeto (ex: AutoControl/), crie a pasta backend e "
     "inicialize o package.json."),
])
course.command(
    "mkdir backend && cd backend\n"
    "npm init -y"
)
course.steps([
    ("Instalar as dependencias principais",
     "Express e o framework que recebe as requisicoes HTTP; TypeScript adiciona "
     "tipagem; ts-node-dev roda o codigo TypeScript direto, reiniciando o "
     "servidor a cada alteracao salva (como um 'live reload' para a API)."),
])
course.command(
    "npm install express cors dotenv\n"
    "npm install -D typescript ts-node-dev @types/node @types/express"
)
course.steps([
    ("Configurar o TypeScript",
     "O arquivo tsconfig.json diz ao compilador onde estao os arquivos-fonte e "
     "para onde deve gerar o codigo JavaScript final (usado em producao)."),
])
course.code(
    '{\n'
    '  "compilerOptions": {\n'
    '    "target": "ES2020",\n'
    '    "module": "commonjs",\n'
    '    "rootDir": "src",\n'
    '    "outDir": "dist",\n'
    '    "strict": true,\n'
    '    "esModuleInterop": true\n'
    '  }\n'
    '}',
    filename="backend/tsconfig.json",
)
course.steps([
    ("Criar o primeiro servidor, so para provar que funciona",
     "Antes de qualquer regra de negocio, e essencial ver o servidor respondendo. "
     "No projeto real, essa responsabilidade e dividida em dois arquivos: app.ts "
     "(monta as regras da aplicacao) e server.ts (liga o servidor numa porta)."),
])
course.code(
    "import 'dotenv/config';\n"
    "import { createApp } from './app';\n\n"
    "const app = createApp();\n"
    "const port = process.env.PORT ? Number(process.env.PORT) : 3333;\n\n"
    "app.listen(port, () => {\n"
    "  console.log(`Sangalli Gestao API rodando em http://localhost:${port}`);\n"
    "});",
    filename="backend/src/server.ts",
)
course.code(
    "import express from 'express';\n"
    "import cors from 'cors';\n\n"
    "export function createApp() {\n"
    "  const app = express();\n"
    "  app.use(cors());\n"
    "  app.use(express.json());\n\n"
    "  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));\n\n"
    "  return app;\n"
    "}",
    filename="backend/src/app.ts (primeira versao, simplificada)",
)
course.p(
    "Rode 'npx ts-node-dev --respawn --transpile-only src/server.ts' e abra "
    "http://localhost:3333/api/health no navegador. Se aparecer {\"status\":\"ok\"}, "
    "seu backend esta de pe. Esse comando e o mesmo que o script 'npm run dev' do "
    "projeto real executa."
)

# ------------------------------------------------------------------ MODULO 4
course.module(4, "Modelando o banco de dados com Prisma")
course.p(
    "O Prisma e um ORM (Object-Relational Mapper): ele permite descrever as "
    "tabelas do banco em um arquivo de texto (schema.prisma) e depois manipular "
    "esses dados usando funcoes JavaScript, sem escrever SQL na mao."
)
course.steps([
    ("Instalar o Prisma e iniciar",
     "O comando 'prisma init' cria a pasta prisma/ com um schema.prisma vazio e "
     "um arquivo .env para a string de conexao com o banco."),
])
course.command(
    "npm install prisma --save-dev\n"
    "npm install @prisma/client\n"
    "npx prisma init"
)
course.steps([
    ("Descrever as tabelas no schema.prisma",
     "Cada 'model' vira uma tabela no banco. Os campos com @relation descrevem "
     "como as tabelas se conectam (ex: um Cliente tem varios Veiculos)."),
])
course.code(
    "model Client {\n"
    "  id        String   @id @default(uuid())\n"
    "  name      String\n"
    "  cpf       String   @unique\n"
    "  phone     String\n"
    "  email     String?\n"
    "  createdAt DateTime @default(now()) @map(\"created_at\")\n\n"
    "  vehicles   Vehicle[]\n"
    "  workOrders WorkOrder[]\n\n"
    "  @@map(\"clients\")\n"
    "}",
    filename="backend/prisma/schema.prisma (modelo simplificado de Cliente)",
)
course.note(
    "No schema.prisma real do projeto ha 10 tabelas: users, clients, vehicles, "
    "services, parts, work_orders, work_order_services, work_order_parts, "
    "work_order_photos, work_order_status_history e payments. Cada uma segue "
    "o mesmo padrao: campos, depois relacionamentos.",
)
course.steps([
    ("Aplicar o schema no banco de dados de verdade",
     "O comando 'migrate dev' compara o schema com o banco e gera/aplica o SQL "
     "necessario para deixa-los iguais - e cria um arquivo de migracao versionado."),
    ("Gerar o Prisma Client",
     "E o 'tradutor' que voce vai importar no codigo para consultar o banco: "
     "prisma.client.findMany(), prisma.client.create(), etc."),
])
course.command(
    "npx prisma migrate dev --name init\n"
    "npx prisma generate"
)
course.p(
    "A partir daqui, sempre que voce alterar o schema.prisma, repita esses dois "
    "comandos para manter o banco e o codigo sincronizados."
)

# ------------------------------------------------------------------ MODULO 5
course.module(5, "Organizando a API em camadas",
              "Por que dividir o codigo em routes, controllers, middlewares e validators.")
course.p(
    "Poderiamos escrever toda a logica dentro de app.ts, mas isso viraria um "
    "arquivo gigante e dificil de manter conforme o sistema cresce. O projeto "
    "Sangalli Gestao usa uma arquitetura em camadas, onde cada arquivo tem uma "
    "unica responsabilidade:"
)
course.table(
    ["Pasta", "Responsabilidade"],
    [
        ["routes/", "Define quais URLs existem e qual funcao atende cada uma"],
        ["controllers/", "Executa a acao: le a requisicao, fala com o banco, monta a resposta"],
        ["middlewares/", "Codigo que roda ANTES do controller (autenticacao, log, etc.)"],
        ["validators/", "Regras de formato dos dados de entrada (com a biblioteca Zod)"],
        ["utils/", "Funcoes auxiliares reutilizaveis (tratamento de erro, wrappers)"],
    ],
    widths=[40, 130],
)
course.steps([
    ("Criar o arquivo central de rotas",
     "Ele importa as rotas de cada recurso e as registra sob um prefixo de URL."),
])
course.code(
    "import { Router } from 'express';\n"
    "import clientRoutes from './clientRoutes';\n"
    "import vehicleRoutes from './vehicleRoutes';\n\n"
    "const router = Router();\n\n"
    "router.get('/health', (_req, res) => res.json({ status: 'ok' }));\n"
    "router.use('/clientes', clientRoutes);\n"
    "router.use('/veiculos', vehicleRoutes);\n\n"
    "export default router;",
    filename="backend/src/routes/index.ts",
)
course.p(
    "E em app.ts, esse roteador central e conectado sob o prefixo /api: "
    "'app.use(\"/api\", routes)'. Assim, uma rota de clientes fica acessivel em "
    "'http://localhost:3333/api/clientes'."
)

# ------------------------------------------------------------------ MODULO 6
course.module(6, "Autenticacao com JWT",
              "Como o sistema reconhece um usuario logado em cada requisicao.")
course.p(
    "JWT (JSON Web Token) e um 'crachá digital' que o servidor entrega depois de "
    "um login valido. Ele carrega quem e o usuario e vem assinado digitalmente, "
    "de forma que ninguem consiga forja-lo sem conhecer o segredo do servidor."
)
course.section("6.1 Guardando senhas com seguranca")
course.p(
    "Senhas nunca sao guardadas como texto puro no banco. O bcrypt transforma a "
    "senha em um hash irreversivel antes de salvar, e depois compara o hash na "
    "hora do login."
)
course.command("npm install bcrypt jsonwebtoken\nnpm install -D @types/bcrypt @types/jsonwebtoken")
course.section("6.2 A rota de login")
course.code(
    "export const login = asyncHandler(async (req, res) => {\n"
    "  const { email, password } = loginSchema.parse(req.body);\n\n"
    "  const user = await prisma.user.findUnique({ where: { email } });\n"
    "  if (!user) throw new UnauthorizedError('E-mail ou senha invalidos.');\n\n"
    "  const passwordMatches = await bcrypt.compare(password, user.passwordHash);\n"
    "  if (!passwordMatches) throw new UnauthorizedError('E-mail ou senha invalidos.');\n\n"
    "  const token = jwt.sign(\n"
    "    { sub: user.id, role: user.role, name: user.name },\n"
    "    process.env.JWT_SECRET as string,\n"
    "    { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' },\n"
    "  );\n\n"
    "  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });\n"
    "});",
    filename="backend/src/controllers/authController.ts",
)
course.section("6.3 O middleware que protege as rotas")
course.code(
    "export function authenticate(req, res, next) {\n"
    "  const authHeader = req.headers.authorization;\n"
    "  if (!authHeader?.startsWith('Bearer ')) {\n"
    "    throw new UnauthorizedError('Token de autenticacao ausente.');\n"
    "  }\n"
    "  const token = authHeader.replace('Bearer ', '');\n\n"
    "  try {\n"
    "    req.user = jwt.verify(token, process.env.JWT_SECRET as string);\n"
    "    next();\n"
    "  } catch {\n"
    "    throw new UnauthorizedError('Token invalido ou expirado.');\n"
    "  }\n"
    "}",
    filename="backend/src/middlewares/auth.ts",
)
course.p(
    "Para proteger um grupo de rotas, basta chamar 'router.use(authenticate)' no "
    "topo do arquivo de rotas daquele recurso - toda rota abaixo dessa linha "
    "passa a exigir o token."
)
course.note(
    "A variavel JWT_SECRET fica no arquivo .env (nunca no codigo-fonte nem no "
    "Git) e deve ser uma string longa e aleatoria. Se ela vazar, qualquer pessoa "
    "consegue forjar tokens validos - por isso .env entra no .gitignore.",
    label="Seguranca",
)

# ------------------------------------------------------------------ MODULO 7
course.module(7, "Construindo o primeiro CRUD: Clientes",
              "CRUD = Create, Read, Update, Delete - as quatro operacoes basicas de um cadastro.")
course.section("7.1 Validando os dados de entrada (Zod)")
course.p(
    "Antes de gravar qualquer coisa no banco, validamos o formato dos dados que "
    "chegaram. O Zod descreve as regras de forma declarativa e gera mensagens de "
    "erro legiveis automaticamente."
)
course.command("npm install zod")
course.code(
    "export const createClientSchema = z.object({\n"
    "  name: z.string().min(2, 'Informe o nome completo.'),\n"
    "  cpf: z.string().min(11, 'CPF invalido.').max(14, 'CPF invalido.'),\n"
    "  phone: z.string().min(8, 'Informe um telefone valido.'),\n"
    "  email: z.string().email('E-mail invalido.').optional().nullable(),\n"
    "});\n\n"
    "export const updateClientSchema = createClientSchema.partial();",
    filename="backend/src/validators/clientValidators.ts",
)
course.section("7.2 O controller: a logica de cada operacao")
course.code(
    "export const listClients = asyncHandler(async (req, res) => {\n"
    "  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });\n"
    "  return res.json(clients);\n"
    "});\n\n"
    "export const createClient = asyncHandler(async (req, res) => {\n"
    "  const data = createClientSchema.parse(req.body);\n"
    "  const client = await prisma.client.create({ data });\n"
    "  return res.status(201).json(client);\n"
    "});",
    filename="backend/src/controllers/clientController.ts",
)
course.section("7.3 As rotas: ligando URL a funcao")
course.code(
    "const router = Router();\n\n"
    "router.use(authenticate);\n\n"
    "router.get('/', listClients);\n"
    "router.get('/:id', getClient);\n"
    "router.post('/', createClient);\n"
    "router.put('/:id', updateClient);\n"
    "router.delete('/:id', deleteClient);\n\n"
    "export default router;",
    filename="backend/src/routes/clientRoutes.ts",
)
course.section("7.4 Testando sem precisar do frontend")
course.p(
    "Use uma ferramenta como Insomnia, Postman ou a extensao Thunder Client do "
    "VS Code para simular requisicoes antes de existir qualquer tela. Primeiro "
    "faca login em POST /api/auth/login para pegar um token; depois use esse "
    "token no cabecalho Authorization das demais chamadas."
)
course.command(
    'POST http://localhost:3333/api/clientes\n'
    'Authorization: Bearer <token do login>\n'
    'Content-Type: application/json\n\n'
    '{ "name": "Maria Silva", "cpf": "12345678900", "phone": "17999999999" }'
)
course.p(
    "Repetindo exatamente esse padrao (validator -> controller -> route) para "
    "cada tabela do banco, voce constroi todos os CRUDs do sistema: veiculos, "
    "servicos, pecas, ordens de servico e assim por diante."
)

# ------------------------------------------------------------------ MODULO 8
course.module(8, "Tratamento de erros centralizado")
course.p(
    "Sem um tratamento central, cada controller precisaria de blocos try/catch "
    "repetidos, e cada erro (validacao, CPF duplicado, item nao encontrado) "
    "responderia num formato diferente para o frontend. A solucao: uma unica "
    "porta de saida para qualquer erro."
)
course.steps([
    ("Um wrapper para funcoes assincronas",
     "Toda funcao de controller e 'async'. Se ela lancar um erro sem esse "
     "wrapper, o Express nao intercepta automaticamente - a aplicacao trava. "
     "O asyncHandler resolve isso encaminhando qualquer erro para o Express."),
])
course.code(
    "export function asyncHandler(handler) {\n"
    "  return (req, res, next) => {\n"
    "    handler(req, res, next).catch(next);\n"
    "  };\n"
    "}",
    filename="backend/src/utils/asyncHandler.ts",
)
course.steps([
    ("Um middleware de erro, registrado por ultimo",
     "O Express reconhece uma funcao com 4 parametros (err, req, res, next) "
     "como tratador de erros e a chama sempre que algo cai no catch acima."),
])
course.code(
    "export function errorHandler(err, req, res, next) {\n"
    "  if (err instanceof AppError) {\n"
    "    return res.status(err.statusCode).json({ error: err.message });\n"
    "  }\n"
    "  if (err instanceof ZodError) {\n"
    "    return res.status(422).json({ error: 'Dados invalidos.', issues: err.issues });\n"
    "  }\n"
    "  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {\n"
    "    return res.status(409).json({ error: 'Ja existe um registro com esse valor unico.' });\n"
    "  }\n"
    "  console.error(err);\n"
    "  return res.status(500).json({ error: 'Erro interno no servidor.' });\n"
    "}",
    filename="backend/src/middlewares/errorHandler.ts",
)
course.p(
    "Em app.ts, esse middleware e registrado por ultimo, depois de todas as "
    "rotas: 'app.use(errorHandler)'. A ordem importa - middlewares de erro so "
    "funcionam se vierem depois das rotas que podem falhar."
)

# ------------------------------------------------------------------ MODULO 9
course.module(9, "Repetindo o padrao para os demais recursos")
course.p(
    "Com o padrao validator -> controller -> route dominado, o restante do "
    "backend e questao de repeticao disciplinada, recurso por recurso:"
)
course.bullets([
    "Veiculos (vehicleRoutes): sempre vinculados a um cliente (clientId), com placa unica.",
    "Servicos e Pecas (serviceRoutes, partRoutes): catalogo com preco, usado para montar orcamentos.",
    "Ordens de Servico (workOrderRoutes): o recurso mais complexo - liga cliente, veiculo, "
    "servicos escolhidos, pecas usadas, fotos e pagamentos em um so registro.",
])
course.section("O fluxo de status da ordem de servico")
course.p(
    "Uma ordem de servico segue um caminho fixo, representado por um enum no "
    "Prisma - isso evita, por exemplo, que uma OS va direto de 'diagnostico' "
    "para 'entregue' sem passar pelas etapas intermediarias:"
)
course.code(
    "enum WorkOrderStatus {\n"
    "  EM_DIAGNOSTICO\n"
    "  AGUARDANDO_APROVACAO\n"
    "  EM_MANUTENCAO\n"
    "  EM_FUNILARIA\n"
    "  EM_PINTURA\n"
    "  EM_TESTE\n"
    "  PRONTO\n"
    "  ENTREGUE\n"
    "  CANCELADO\n"
    "}",
    filename="backend/prisma/schema.prisma",
)
course.p(
    "Cada mudanca de status e registrada numa tabela separada, work_order_status_history, "
    "guardando quem mudou e quando - isso e o que alimenta a 'linha do tempo' que "
    "o cliente ve na pagina publica de acompanhamento."
)

# ------------------------------------------------------------------ MODULO 10
course.module(10, "Funcionalidades especiais do backend")
course.section("10.1 Pagina publica de acompanhamento, sem login")
course.p(
    "Cada ordem de servico recebe um publicToken (um UUID aleatorio) no momento "
    "em que e criada. Uma rota separada e publica (sem passar pelo middleware "
    "authenticate) busca a OS por esse token, e devolve so os dados que o "
    "cliente pode ver - escondendo notas internas da oficina."
)
course.code(
    "router.get('/:token', async (req, res) => {\n"
    "  const workOrder = await prisma.workOrder.findUnique({\n"
    "    where: { publicToken: req.params.token },\n"
    "    include: { client: true, vehicle: true, statusHistory: true, photos: true },\n"
    "  });\n"
    "  if (!workOrder) throw new NotFoundError();\n"
    "  return res.json(workOrder); // internalNotes fica de fora da resposta\n"
    "});",
    filename="backend/src/routes/publicRoutes.ts (resumo)",
)
course.section("10.2 QR Code")
course.p(
    "A biblioteca 'qrcode' gera uma imagem a partir do link publico "
    "(/acompanhar/:token), permitindo que o cliente escaneie no balcao da "
    "oficina em vez de digitar o link."
)
course.section("10.3 Upload de fotos (Cloudinary)")
course.p(
    "As fotos do veiculo nao ficam no banco de dados - so a URL e o identificador "
    "(public_id) sao guardados na tabela work_order_photos. O arquivo em si sobe "
    "para o Cloudinary, um servico externo especializado em imagens, via Multer "
    "(que recebe o upload) e o SDK do Cloudinary (que envia o arquivo)."
)
course.section("10.4 Dashboard e relatorios")
course.p(
    "Rotas dedicadas (dashboardRoutes, reportRoutes) usam funcoes de agregacao "
    "do Prisma (groupBy, aggregate) para calcular faturamento mensal, ordens por "
    "status e servicos mais realizados - dados que alimentam os graficos do "
    "frontend."
)

# ------------------------------------------------------------------ MODULO 11
course.module(11, "Seguranca da API")
course.p(
    "Alem da autenticacao JWT, a API aplica camadas adicionais de protecao, "
    "configuradas centralmente em app.ts:"
)
course.table(
    ["Ferramenta", "O que protege"],
    [
        ["helmet", "Define cabecalhos HTTP de seguranca (evita alguns ataques comuns do navegador)"],
        ["cors", "Permite requisicoes apenas do dominio do frontend (FRONTEND_URL)"],
        ["express-rate-limit", "Limita quantas requisicoes por IP num periodo (evita forca bruta no login)"],
        ["bcrypt", "Senhas nunca ficam em texto puro no banco"],
        ["zod", "Nenhum dado entra no banco sem validacao de formato"],
    ],
    widths=[45, 125],
)
course.code(
    "app.use(helmet());\n"
    "app.use(cors({ origin: process.env.FRONTEND_URL }));\n\n"
    "const authLimiter = rateLimit({\n"
    "  windowMs: 15 * 60 * 1000,\n"
    "  limit: 20,\n"
    "  message: { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },\n"
    "});\n"
    "app.use('/api/auth/login', authLimiter);",
    filename="backend/src/app.ts (trecho de seguranca)",
)

# ------------------------------------------------------------------ MODULO 12
course.module(12, "Testes automatizados")
course.p(
    "Testes automatizados confirmam que o sistema continua funcionando depois "
    "de qualquer alteracao, sem precisar testar manualmente tudo de novo. O "
    "backend usa Vitest (executor de testes) junto com Supertest (simula "
    "requisicoes HTTP sem precisar do servidor rodando de verdade)."
)
course.command("npm install -D vitest supertest")
course.code(
    "import { describe, it, expect } from 'vitest';\n"
    "import request from 'supertest';\n"
    "import { createApp } from '../src/app';\n\n"
    "describe('POST /api/clientes', () => {\n"
    "  it('rejeita criacao sem token de autenticacao', async () => {\n"
    "    const app = createApp();\n"
    "    const response = await request(app).post('/api/clientes').send({});\n"
    "    expect(response.status).toBe(401);\n"
    "  });\n"
    "});",
    filename="backend/tests/clients.test.ts (exemplo simplificado)",
)
course.p(
    "No frontend, o mesmo Vitest e usado junto com React Testing Library, que "
    "simula cliques e digitacao do usuario nos componentes."
)

# ------------------------------------------------------------------ MODULO 13
course.module(13, "Criando o frontend do zero",
              "A segunda pasta do projeto: frontend/, com React, Vite, TypeScript e Tailwind.")
course.steps([
    ("Criar o projeto com Vite",
     "O Vite e a ferramenta que compila e serve o React durante o desenvolvimento, "
     "com recarregamento instantaneo ao salvar um arquivo."),
])
course.command("npm create vite@latest frontend -- --template react-ts\ncd frontend\nnpm install")
course.steps([
    ("Instalar e configurar o Tailwind CSS",
     "Tailwind fornece classes utilitarias (ex: 'flex', 'p-4', 'text-green-600') "
     "que voce combina direto no HTML/JSX, sem escrever arquivos .css separados "
     "para cada componente."),
])
course.command("npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p")
course.steps([
    ("Organizar a estrutura de pastas",
     "O projeto real separa responsabilidades claramente dentro de src/:"),
])
course.table(
    ["Pasta", "Conteudo"],
    [
        ["pages/", "Uma tela inteira do sistema (ClientsPage, DashboardPage...)"],
        ["components/", "Pedacos de interface reutilizaveis (StatCard, StatusBadge...)"],
        ["contexts/", "Estado compartilhado entre varias telas (AuthContext)"],
        ["services/", "Funcoes que chamam a API (clientService.ts, authService.ts...)"],
        ["types/", "Definicoes TypeScript compartilhadas (User, Client, WorkOrder...)"],
    ],
    widths=[35, 135],
)

# ------------------------------------------------------------------ MODULO 14
course.module(14, "Consumindo a API no frontend")
course.section("14.1 Um cliente HTTP central (axios)")
course.p(
    "Em vez de repetir a URL base e o cabecalho de autenticacao em cada tela, "
    "um unico arquivo configura o axios (biblioteca de requisicoes HTTP) para "
    "toda a aplicacao."
)
course.code(
    "export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });\n\n"
    "api.interceptors.request.use((config) => {\n"
    "  const token = localStorage.getItem('autocontrol:token');\n"
    "  if (token) config.headers.Authorization = `Bearer ${token}`;\n"
    "  return config;\n"
    "});\n\n"
    "api.interceptors.response.use(\n"
    "  (response) => response,\n"
    "  (error) => {\n"
    "    if (error.response?.status === 401) {\n"
    "      localStorage.removeItem('autocontrol:token');\n"
    "      window.location.href = '/login';\n"
    "    }\n"
    "    return Promise.reject(error);\n"
    "  },\n"
    ");",
    filename="frontend/src/services/api.ts",
)
course.section("14.2 Guardando quem esta logado (Context API)")
course.p(
    "O AuthContext expoe, para qualquer tela, se ha um usuario logado e as "
    "funcoes login/logout - e persiste o token no localStorage para sobreviver "
    "a um F5 na pagina."
)
course.code(
    "const login = async (email, password) => {\n"
    "  const response = await loginRequest(email, password);\n"
    "  localStorage.setItem('autocontrol:token', response.token);\n"
    "  setToken(response.token);\n"
    "  setUser(response.user);\n"
    "};",
    filename="frontend/src/contexts/AuthContext.tsx (resumo)",
)
course.section("14.3 Bloqueando telas para quem nao esta logado")
course.code(
    "export function ProtectedRoute() {\n"
    "  const { isAuthenticated, isLoading } = useAuth();\n"
    "  if (isLoading) return null;\n"
    "  if (!isAuthenticated) return <Navigate to=\"/login\" replace />;\n"
    "  return <Outlet />;\n"
    "}",
    filename="frontend/src/components/ProtectedRoute.tsx",
)
course.p(
    "No React Router, essa checagem envolve um grupo inteiro de rotas de uma so "
    "vez, sem precisar repetir a logica em cada pagina individualmente."
)

# ------------------------------------------------------------------ MODULO 15
course.module(15, "Construindo as telas do sistema")
course.p(
    "Com a comunicacao com a API pronta, cada tela segue um padrao parecido: "
    "buscar dados ao montar o componente, mostrar em uma tabela/lista, e "
    "oferecer um formulario para criar/editar."
)
course.code(
    "export function ClientsPage() {\n"
    "  const [clients, setClients] = useState<Client[]>([]);\n\n"
    "  useEffect(() => {\n"
    "    listClients().then(setClients);\n"
    "  }, []);\n\n"
    "  return (\n"
    "    <div>\n"
    "      {clients.map((c) => <ClientRow key={c.id} client={c} />)}\n"
    "    </div>\n"
    "  );\n"
    "}",
    filename="frontend/src/pages/ClientsPage.tsx (estrutura simplificada)",
)
course.p(
    "As rotas de tela sao centralizadas em App.tsx, que decide qual componente "
    "mostrar para cada URL - e envolve as rotas privadas dentro de ProtectedRoute:"
)
course.code(
    "<Routes>\n"
    "  <Route path=\"/login\" element={<LoginPage />} />\n"
    "  <Route path=\"/acompanhar/:token\" element={<PublicTrackingPage />} />\n\n"
    "  <Route element={<ProtectedRoute />}>\n"
    "    <Route element={<AppLayout />}>\n"
    "      <Route path=\"/dashboard\" element={<DashboardPage />} />\n"
    "      <Route path=\"/clientes\" element={<ClientsPage />} />\n"
    "      <Route path=\"/ordens\" element={<WorkOrdersPage />} />\n"
    "      {/* ...demais paginas */}\n"
    "    </Route>\n"
    "  </Route>\n"
    "</Routes>",
    filename="frontend/src/App.tsx (resumo)",
)
course.p(
    "Repare que /login e /acompanhar/:token ficam FORA do ProtectedRoute - fazem "
    "sentido sem estar logado, ja que sao, respectivamente, a propria tela de "
    "login e a pagina publica do cliente."
)
course.p(
    "O painel (DashboardPage) usa a biblioteca Recharts para desenhar graficos "
    "(faturamento mensal, ordens por status) a partir dos dados que vem da rota "
    "/dashboard do backend."
)

# ------------------------------------------------------------------ MODULO 16
course.module(16, "Transformando em PWA")
course.p(
    "PWA (Progressive Web App) permite que o site seja 'instalado' no celular, "
    "como um aplicativo, e continue funcionando (parcialmente) sem internet. No "
    "projeto, isso e feito com o plugin vite-plugin-pwa."
)
course.command("npm install -D vite-plugin-pwa")
course.code(
    "import { VitePWA } from 'vite-plugin-pwa';\n\n"
    "export default defineConfig({\n"
    "  plugins: [\n"
    "    react(),\n"
    "    VitePWA({\n"
    "      registerType: 'autoUpdate',\n"
    "      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] },\n"
    "    }),\n"
    "  ],\n"
    "});",
    filename="frontend/vite.config.ts (resumo)",
)
course.p(
    "Um arquivo manifest.json descreve o nome do app, icones e cores; o plugin "
    "gera automaticamente um Service Worker (um script que roda em segundo "
    "plano no navegador) responsavel por guardar arquivos em cache."
)

# ------------------------------------------------------------------ MODULO 17
course.module(17, "Publicando em producao (deploy)")
course.p(
    "Com tudo funcionando localmente, falta colocar o sistema no ar, acessivel "
    "de qualquer lugar. Cada camada tem um servico de nuvem proprio:"
)
course.table(
    ["Camada", "Servico usado", "O que voce configura"],
    [
        ["Banco de dados", "Supabase", "Projeto Postgres gerenciado; a DATABASE_URL vai para as variaveis de ambiente do backend"],
        ["Backend (API)", "Render", "Web Service Node; build 'npm install && npm run build'; start 'npm start'"],
        ["Frontend", "Netlify", "Build 'npm run build'; publica a pasta dist/"],
        ["Imagens", "Cloudinary", "Credenciais tambem via variaveis de ambiente, nunca no codigo"],
    ],
    widths=[30, 35, 105],
)
course.note(
    "Nenhuma senha, chave de API ou string de conexao deve ir para o repositorio "
    "Git. Elas ficam no arquivo .env local (que entra no .gitignore) e sao "
    "cadastradas manualmente no painel de cada servico de hospedagem.",
    label="Regra de ouro",
)
course.p(
    "Depois do primeiro deploy, tanto o Render quanto o Netlify observam o "
    "repositorio no GitHub: a cada 'git push' na branch principal, uma nova "
    "versao e publicada automaticamente."
)

# ------------------------------------------------------------------ MODULO 18
course.module(18, "Recapitulando o que voce aprendeu")
course.p(
    "Se voce seguiu os 17 modulos anteriores, construiu - na pratica, nao so na "
    "teoria - uma aplicacao full-stack completa. Veja o mapa geral do que foi "
    "aprendido:"
)
course.bullets([
    "Como separar um sistema em frontend, backend e banco de dados, e por que essa separacao existe.",
    "Como modelar dados relacionais com Prisma e aplicar migracoes num banco Postgres real.",
    "Como organizar uma API REST em camadas (rotas, controllers, middlewares, validators).",
    "Como autenticacao com JWT funciona de ponta a ponta - do login ao middleware que protege cada rota.",
    "Como validar dados de entrada e centralizar o tratamento de erros.",
    "Como construir uma interface React que consome essa API, com autenticacao e rotas protegidas.",
    "Como transformar o frontend num PWA instalavel.",
    "Como publicar cada camada num servico de nuvem gratuito.",
])
course.section("Proximos passos sugeridos")
course.bullets([
    "Adicionar permissões por perfil de usuario (hoje o sistema tem so o papel ADMIN).",
    "Implementar notificacoes automaticas (e-mail/WhatsApp) quando o status da OS muda.",
    "Exportar relatorios em PDF/Excel.",
    "Escrever mais testes automatizados, cobrindo os fluxos criticos (login, criacao de OS, orcamento).",
])
course.p(
    "O melhor jeito de fixar esse conteudo e comparar cada modulo deste curso "
    "com o codigo real do repositorio Sangalli Gestao, arquivo por arquivo, e "
    "tentar recriar um recurso novo (por exemplo, um cadastro de fornecedores) "
    "seguindo exatamente o mesmo padrao."
)

course.output("CURSO_DO_ZERO_AO_SANGALLI_GESTAO.pdf")
print("OK - PDF gerado")
