# -*- coding: utf-8 -*-
"""Gera o Relatório Parcial (Sangalli Gestão) em .docx, seguindo o modelo oficial
UNIVESP (Modelo_-_Relatorio_Parcial): Times New Roman 12, espaçamento 1,5 (resumo em
espaçamento simples e parágrafo único), margens 3-2-3-2 cm, títulos de capítulo em
maiúsculas/negrito sempre em nova página, numeração de página no canto superior
direito iniciando na Introdução."""

import sys

from docx import Document
from docx.shared import Cm, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

# ---------- Estilo base ----------
style = doc.styles["Normal"]
style.font.name = "Times New Roman"
style.font.size = Pt(12)
style.paragraph_format.line_spacing = 1.5
style.paragraph_format.space_after = Pt(0)

rFonts = style.element.rPr.rFonts
rFonts.set(qn("w:eastAsia"), "Times New Roman")


def apply_margins(section):
    section.top_margin = Cm(3)
    section.left_margin = Cm(3)
    section.bottom_margin = Cm(2)
    section.right_margin = Cm(2)


for sec in doc.sections:
    apply_margins(sec)


def add_page_break():
    doc.add_page_break()


def p(text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, bold=False, size=12, space_after=12,
      line_spacing=1.5, upper=False, italic=False):
    para = doc.add_paragraph()
    para.alignment = align
    para.paragraph_format.line_spacing = line_spacing
    para.paragraph_format.space_after = Pt(space_after)
    run = para.add_run(text.upper() if upper else text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    run.font.name = "Times New Roman"
    return para


def heading(text, new_page=False):
    """Título de capítulo (1 INTRODUÇÃO, 2 DESENVOLVIMENTO, REFERÊNCIAS): maiúsculas,
    negrito, alinhado à esquerda, sempre em nova página."""
    if new_page:
        add_page_break()
    para = doc.add_paragraph()
    para.paragraph_format.line_spacing = 1.5
    para.paragraph_format.space_after = Pt(12)
    run = para.add_run(text.upper())
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return para


def subheading(text):
    """Subtítulo (2.1, 2.2, 2.4.1 ...): negrito, alinhado à esquerda, SEM nova página."""
    para = doc.add_paragraph()
    para.paragraph_format.line_spacing = 1.5
    para.paragraph_format.space_before = Pt(6)
    para.paragraph_format.space_after = Pt(8)
    run = para.add_run(text)
    run.bold = True
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    return para


def add_table(headers, rows, caption, source="Elaboração dos autores (2026)."):
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.line_spacing = 1.0
    cap.paragraph_format.space_after = Pt(4)
    r = cap.add_run(caption)
    r.bold = True
    r.font.size = Pt(11)
    r.font.name = "Times New Roman"

    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = ""
        run = hdr_cells[i].paragraphs[0].add_run(h)
        run.bold = True
        run.font.size = Pt(10)
        run.font.name = "Times New Roman"
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(val)
            run.font.size = Pt(10)
            run.font.name = "Times New Roman"

    src = doc.add_paragraph()
    src.alignment = WD_ALIGN_PARAGRAPH.CENTER
    src.paragraph_format.line_spacing = 1.0
    src.paragraph_format.space_after = Pt(12)
    r2 = src.add_run(f"Fonte: {source}")
    r2.italic = True
    r2.font.size = Pt(10)
    r2.font.name = "Times New Roman"


def add_page_number_field(paragraph):
    run = paragraph.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(10)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


TEAM = [
    "Deise Vizu da Silva",
    "Geovane Aparecido de Oliveira",
    "Geovane Henrique de Oliveira",
    "João França Naldi",
    "Patrick Allan dos Santos Faustino",
    "Taiga Renata da Cruz",
    "Taíse Renata da Cruz",
    "Wanderson Carvalho de Deus",
]

TITLE = ("Sangalli Gestão: sistema web para controle financeiro e de ordens de "
         "serviço da Oficina Funilaria Sangalli")
LOCAL = "Pontal, Franca, Taquaritinga, Jaborandi, Olímpia, Restinga – SP"
ANO = "2026"
TUTOR = "Fernando Melo Langon"

# ================= CAPA =================
p("UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO", align=WD_ALIGN_PARAGRAPH.CENTER,
  bold=True, space_after=0)
for _ in range(6):
    p("", space_after=0)
for name in TEAM:
    p(name, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
for _ in range(6):
    p("", space_after=0)
p(TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=0)
for _ in range(8):
    p("", space_after=0)
p(LOCAL, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
p(ANO, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)

add_page_break()

# ================= FOLHA DE ROSTO =================
p("UNIVERSIDADE VIRTUAL DO ESTADO DE SÃO PAULO", align=WD_ALIGN_PARAGRAPH.CENTER,
  bold=True, space_after=0)
for _ in range(6):
    p("", space_after=0)
p(TITLE, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=0)
for _ in range(6):
    p("", space_after=0)
recuo = doc.add_paragraph()
recuo.paragraph_format.left_indent = Cm(8)
recuo.paragraph_format.line_spacing = 1.5
run = recuo.add_run(
    "Relatório Técnico-Científico apresentado na disciplina de Projeto Integrador II "
    "para o curso de Bacharelado em Tecnologia da Informação / Ciência de Dados / "
    "Engenharia da Computação da Universidade Virtual do Estado de São Paulo (UNIVESP)."
)
run.font.size = Pt(12)
run.font.name = "Times New Roman"
recuo2 = doc.add_paragraph()
recuo2.paragraph_format.left_indent = Cm(8)
recuo2.paragraph_format.space_before = Pt(12)
run2 = recuo2.add_run(f"Tutor: {TUTOR}")
run2.font.size = Pt(12)
run2.font.name = "Times New Roman"
for _ in range(8):
    p("", space_after=0)
p(LOCAL, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
p(ANO, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)

add_page_break()

# ================= FICHA CATALOGRÁFICA =================
p("FICHA CATALOGRÁFICA", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=24)
authors_ref = ("SILVA, Deise Vizu da; OLIVEIRA, Geovane Aparecido de; OLIVEIRA, Geovane "
               "Henrique de; NALDI, João França; FAUSTINO, Patrick Allan dos Santos; CRUZ, "
               "Taiga Renata da; CRUZ, Taíse Renata da; DEUS, Wanderson Carvalho de. ")
ficha = doc.add_paragraph()
ficha.paragraph_format.line_spacing = 1.5
r1 = ficha.add_run(authors_ref)
r1.font.name = "Times New Roman"
r1.font.size = Pt(12)
r2 = ficha.add_run("Sangalli Gestão: sistema web para controle financeiro e de ordens de "
                    "serviço da Oficina Funilaria Sangalli. ")
r2.bold = True
r2.font.name = "Times New Roman"
r2.font.size = Pt(12)
r3 = ficha.add_run(
    f"00f. Relatório Técnico-Científico. Bacharelado em Tecnologia da Informação – "
    f"Universidade Virtual do Estado de São Paulo. Tutor: {TUTOR}. Polos Pontal, Franca, "
    f"Taquaritinga, Jaborandi, Olímpia e Restinga – SP, {ANO}."
)
r3.font.name = "Times New Roman"
r3.font.size = Pt(12)
p("(Nota: substituir \"00f.\" pelo número final de folhas do trabalho antes da entrega.)",
  align=WD_ALIGN_PARAGRAPH.LEFT, size=10, space_after=0, italic=True)

add_page_break()

# ================= RESUMO (parágrafo único, espaçamento simples, até 250 palavras) =====
p("RESUMO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=12)
resumo_text = (
    "Este trabalho apresenta o Sangalli Gestão, sistema web desenvolvido como Projeto "
    "Integrador II da UNIVESP para digitalizar a administração da Oficina Funilaria Sangalli, "
    "micro empresa do setor de funilaria e mecânica automotiva de Jaborandi-SP. Entrevista "
    "estruturada aplicada ao proprietário Daniel Sangalli revelou que a oficina abre, em "
    "média, quatro ordens de serviço por semana, registradas em papel avulso, com cerca de 30 "
    "minutos diários gastos organizando anotações e dificuldade de localizar dados de clientes "
    "em cerca de 50% dos casos, evidenciando a necessidade de um controle digital centralizado. "
    "O objetivo do projeto foi desenvolver e implantar um sistema que substituísse esses "
    "controles manuais por uma ferramenta única de gestão financeira e de ordens de serviço. "
    "A metodologia seguiu três etapas — ouvir e interpretar o contexto, criar e prototipar, e "
    "implementar e testar —, conduzidas de forma incremental. Foram utilizados React e "
    "TypeScript no front-end, Node.js, Express e Prisma ORM no back-end, e PostgreSQL, "
    "hospedado no Supabase, como banco de dados relacional. Como resultado parcial, foi "
    "implementado um sistema com autenticação de usuários, cadastro de clientes e veículos, "
    "gestão de ordens de serviço com histórico de status, catálogo de serviços e peças com "
    "orçamento automático, upload de fotos e uma página pública de acompanhamento sem "
    "necessidade de login, validados por 45 testes automatizados. O projeto encontra-se em "
    "fase de consolidação da infraestrutura em nuvem e de validação com o proprietário, etapas "
    "a serem aprofundadas no relatório final."
)
p(resumo_text, line_spacing=1.0, space_after=12)
kw = doc.add_paragraph()
kw.paragraph_format.line_spacing = 1.0
r = kw.add_run("PALAVRAS-CHAVE: ")
r.bold = True
r.font.name = "Times New Roman"
r.font.size = Pt(12)
r2 = kw.add_run("Sistema Web; Sangalli Gestão; Gestão de Oficina; Ordens de Serviço; Banco de "
                "Dados.")
r2.font.name = "Times New Roman"
r2.font.size = Pt(12)

_word_count = len(resumo_text.split())
print(f"[verificação] Resumo tem {_word_count} palavras (limite: 250).")
if _word_count > 250:
    print("!! ATENÇÃO: resumo excede 250 palavras, revisar antes de entregar.")

add_page_break()

# ================= LISTA DE TABELAS =================
p("LISTA DE TABELAS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=16)
tabelas_lista = [
    ("TABELA 1", "SÍNTESE DA ENTREVISTA COM O PROPRIETÁRIO (DANIEL SANGALLI)", "seção 2.5.1"),
    ("TABELA 2", "PERCEPÇÃO DE CLIENTES DA OFICINA", "seção 2.5.1"),
    ("TABELA 3", "ADERÊNCIA DO PROJETO ÀS EXIGÊNCIAS DO TEMA NORTEADOR DO PI", "seção 2.3"),
    ("TABELA 4", "COMPARATIVO DE TECNOLOGIAS AVALIADAS", "seção 2.5.2"),
    ("TABELA 5", "ESTRUTURA SIMPLIFICADA DA TABELA WORK_ORDERS", "seção 2.5.2"),
    ("TABELA 6", "FUNCIONALIDADES DO SISTEMA E STATUS DE IMPLEMENTAÇÃO", "seção 2.5.3"),
]
for numero, titulo, ref in tabelas_lista:
    para = doc.add_paragraph()
    para.paragraph_format.line_spacing = 1.0
    para.paragraph_format.space_after = Pt(8)
    r = para.add_run(f"{numero} – {titulo} ")
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r2 = para.add_run(f"(ver {ref})")
    r2.italic = True
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(11)

add_page_break()

# ================= SUMÁRIO =================
p("SUMÁRIO", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, space_after=12)
sumario_items = [
    ("1 INTRODUÇÃO", 0, True),
    ("2 DESENVOLVIMENTO", 0, True),
    ("2.1 Objetivos", 1, False),
    ("2.2 Justificativa e Delimitação do Problema", 1, False),
    ("2.3 Fundamentação Teórica", 1, False),
    ("2.4 Metodologia", 1, False),
    ("2.4.1 Ouvir e Interpretar o Contexto", 2, False),
    ("2.4.2 Criar / Prototipar", 2, False),
    ("2.4.3 Implementar / Testar", 2, False),
    ("2.5 Resultados Preliminares: Solução Inicial", 1, False),
    ('2.5.1 Etapa "Ouvir e Interpretar o Contexto"', 2, False),
    ('2.5.2 Etapa "Criar e Prototipar"', 2, False),
    ('2.5.3 Etapa "Implementar e Testar"', 2, False),
    ("REFERÊNCIAS", 0, True),
]
for text, level, bold in sumario_items:
    para = doc.add_paragraph()
    para.paragraph_format.left_indent = Cm(level * 0.8)
    para.paragraph_format.line_spacing = 1.5
    run = para.add_run(text)
    run.bold = bold
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)

# ---- a partir daqui: nova seção, com numeração de página (canto superior direito) ----
main_section = doc.add_section(WD_SECTION.NEW_PAGE)
apply_margins(main_section)
main_section.header.is_linked_to_previous = False
header_p = main_section.header.paragraphs[0]
header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
add_page_number_field(header_p)

# ================= 1 INTRODUÇÃO =================
heading("1 Introdução")
p(
    "A gestão administrativa e financeira é um dos maiores desafios enfrentados por micro e "
    "pequenas empresas (MPEs) no Brasil, especialmente em negócios de prestação de serviços, nos "
    "quais o controle de atendimentos, materiais e valores costuma ficar disperso em cadernos, "
    "planilhas e mensagens de aplicativos. Esse cenário compromete não apenas a organização "
    "interna do negócio, mas também a experiência do cliente, que fica sem visibilidade sobre o "
    "andamento do serviço contratado."
)
p(
    "Na Oficina Funilaria Sangalli, esse problema se manifesta diretamente no dia a dia: o "
    "proprietário controla ordens de serviço, orçamentos e recebimentos por meio de anotações "
    "manuais e planilhas desconectadas entre si, sem um sistema que centralize essas "
    "informações. A ausência de automação dificulta o acompanhamento do status de cada veículo, a "
    "rastreabilidade de peças utilizadas e a clareza sobre o fluxo de caixa da oficina, gerando "
    "retrabalho e insegurança na tomada de decisões."
)
p(
    "Diante desse cenário, este projeto propõe o desenvolvimento do Sangalli Gestão, um sistema "
    "web responsivo que centraliza o cadastro de clientes e veículos, o gerenciamento de ordens "
    "de serviço com histórico de status, o cálculo automático de orçamentos e um canal público de "
    "acompanhamento para o cliente final. O objetivo é aplicar tecnologias modernas de "
    "desenvolvimento de software para resolver um problema real de gestão em uma micro empresa "
    "local, substituindo controles manuais por uma ferramenta única, acessível e de baixo custo "
    "de manutenção."
)

# ================= 2 DESENVOLVIMENTO =================
heading("2 Desenvolvimento", new_page=True)

subheading("2.1 Objetivos")
p(
    "O projeto tem como objetivo desenvolver e implantar um sistema web integrado de controle "
    "financeiro e de ordens de serviço para a Oficina Funilaria Sangalli, substituindo os "
    "processos manuais em papel e planilhas desconectadas por uma ferramenta única, prática e "
    "acessível."
)
p("Para o alcance desse objetivo, foram estabelecidos os seguintes objetivos específicos:")
bullets1 = [
    "Identificar as necessidades reais da oficina por meio de visitas e entrevistas com o proprietário;",
    "Mapear os processos administrativos e financeiros do negócio (cadastro de clientes e veículos, abertura e acompanhamento de ordens de serviço, controle de peças e serviços, registro de pagamentos);",
    "Desenvolver uma interface responsiva, acessível e intuitiva utilizando React, TypeScript e Tailwind CSS;",
    "Desenvolver uma API REST segura em Node.js/Express, com autenticação via JWT;",
    "Integrar um banco de dados relacional (PostgreSQL, hospedado no Supabase) para armazenamento e consulta das informações da oficina;",
    "Aplicar boas práticas de controle de versão com Git e GitHub;",
    "Validar a solução com o proprietário da oficina, coletando devolutivas para aprimoramento contínuo.",
]
for b in bullets1:
    para = doc.add_paragraph(style="List Bullet")
    para.paragraph_format.line_spacing = 1.5
    para.paragraph_format.space_after = Pt(4)
    run = para.add_run(b)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)

subheading("2.2 Justificativa e Delimitação do Problema")
p(
    "A organização administrativa é determinante para a sustentabilidade de micro e pequenas "
    "empresas, que em geral não possuem departamentos de TI próprios nem recursos para adquirir "
    "sistemas de gestão comerciais de alto custo. Na Oficina Funilaria Sangalli, esse cenário se "
    "confirma: o negócio é reconhecido pela qualidade técnica dos reparos, mas o dia a dia "
    "administrativo é sobrecarregado pela dependência de anotações manuais para registrar ordens "
    "de serviço, controlar peças e acompanhar o fluxo de caixa."
)
p(
    "Para confirmar e quantificar esse cenário, o grupo aplicou uma entrevista estruturada com o "
    "proprietário e gestor da oficina, Daniel Sangalli. Os dados coletados mostram que a oficina "
    "abre, em média, 4 ordens de serviço por semana, registradas hoje em papel avulso; que o "
    "proprietário gasta cerca de 30 minutos por dia organizando anotações, procurando "
    "informações de clientes ou calculando orçamentos; que já teve dificuldade para localizar "
    "informações de um cliente ou veículo atendido anteriormente em cerca de 50% das vezes; e "
    "que o controle de valores recebidos e pendentes é feito por meio de anotações em papel e "
    "mensagens de WhatsApp. Quando questionado sobre o quanto um sistema digital ajudaria a "
    "resolver essas dificuldades, em uma escala de 1 a 5, o proprietário atribuiu nota 5 (muito "
    "útil). Esses dados evidenciam três dificuldades recorrentes: (i) falta de rastreabilidade do "
    "andamento de cada ordem de serviço, o que dificulta informar o cliente sobre o status do "
    "veículo; (ii) dificuldade em localizar o histórico de peças e serviços utilizados em cada "
    "atendimento; e (iii) falta de clareza sobre o fluxo de caixa (entradas e saídas "
    "financeiras), já que os registros dependem de anotações dispersas em papel e WhatsApp."
)
p(
    "Além da entrevista com o proprietário, o grupo aplicou uma ficha de percepção com clientes "
    "da oficina. As respostas coletadas indicam que o acompanhamento do reparo hoje depende do "
    "aviso direto da oficina por WhatsApp ou ligação, e que, embora a dificuldade em saber se o "
    "veículo estava pronto ou qual era o valor do orçamento seja relatada como rara, um link de "
    "acompanhamento acessível pelo celular, sem necessidade de ligar para a oficina, foi avaliado "
    "com nota 5 (muito útil) — reforçando a relevância de uma página pública de acompanhamento "
    "como parte da solução."
)
p(
    "Até o momento, a oficina não dispõe de nenhuma ferramenta digital que integre esses "
    "processos. Essa lacuna constitui um obstáculo real ao crescimento do negócio, tanto pelo "
    "risco de perda de informações quanto pela ausência de transparência com os clientes, que não "
    "têm como acompanhar o andamento do próprio veículo sem entrar em contato direto com a "
    "oficina."
)
p(
    "Diante desse cenário, o grupo delimitou o problema central da seguinte forma: como "
    "desenvolver e implantar um sistema web que centralize o controle financeiro e o "
    "gerenciamento de ordens de serviço da Oficina Funilaria Sangalli, substituindo os controles "
    "manuais por uma ferramenta digital integrada e acessível? A proposta de solução é o sistema "
    "web Sangalli Gestão, que busca responder a essa questão por meio de uma plataforma que "
    "unifica cadastro de clientes e veículos, abertura e acompanhamento de ordens de serviço, "
    "orçamentos automáticos e um canal público de acompanhamento, dispensando controles paralelos "
    "em papel ou planilha."
)

subheading("2.3 Fundamentação Teórica")
p(
    "A adoção de sistemas de informação como suporte à gestão de pequenas empresas é amplamente "
    "discutida na literatura de Tecnologia da Informação. Segundo Laudon e Laudon (2014), os "
    "sistemas de informação consistem em um conjunto de componentes interconectados responsáveis "
    "por coletar, processar, armazenar e distribuir informações, com o objetivo de apoiar a "
    "tomada de decisão e o controle dentro de uma organização. No contexto de uma oficina "
    "mecânica, essa definição se traduz na necessidade de um sistema que registre, de forma "
    "estruturada, clientes, veículos, ordens de serviço e movimentações financeiras, substituindo "
    "controles paralelos e sujeitos a erro humano."
)
p(
    "A organização e o armazenamento dos dados do sistema estão diretamente ligados ao uso de "
    "bancos de dados relacionais. De acordo com Silberschatz, Korth e Sudarshan (2020), um banco "
    "de dados consiste em uma coleção estruturada de dados interconectados, administrada por um "
    "Sistema Gerenciador de Banco de Dados (SGBD), responsável pela definição, manipulação e "
    "controle dessas informações. Os SGBDs relacionais organizam os dados em tabelas compostas "
    "por linhas e colunas, relacionadas entre si por chaves estrangeiras, o que garante "
    "integridade referencial e consistência. No Sangalli Gestão, essa estrutura relacional é "
    "utilizada para representar as entidades do domínio do negócio — clientes, veículos, ordens "
    "de serviço, serviços, peças, pagamentos e histórico de status — mantendo a rastreabilidade "
    "entre elas, e é implementada em PostgreSQL, hospedado no Supabase, por meio do ORM Prisma."
)
p(
    "No que diz respeito à arquitetura de software, o sistema segue o modelo cliente-servidor, em "
    "que o front-end consome uma API REST exposta pelo back-end. Pressman e Maxim (2021) "
    "destacam que a separação entre camadas de apresentação, lógica de negócio e persistência de "
    "dados favorece a manutenibilidade e a evolução do software ao longo do tempo, princípio "
    "adotado na organização do projeto em dois repositórios/diretórios independentes (frontend e "
    "backend), comunicando-se por meio de requisições HTTP autenticadas."
)
p(
    "A camada de autenticação do sistema utiliza tokens JWT (JSON Web Token), um padrão "
    "amplamente adotado para autenticação stateless em aplicações web, no qual as informações do "
    "usuário autenticado são codificadas e assinadas digitalmente, dispensando o armazenamento de "
    "sessão no servidor. Essa abordagem, combinada ao uso de hashing de senhas (bcrypt) e de "
    "middlewares de segurança como Helmet e limitação de requisições (rate limiting), busca "
    "mitigar riscos comuns em aplicações web expostas publicamente, como ataques de força bruta e "
    "vazamento de credenciais."
)
p(
    "O uso de ferramentas de controle de versão também foi fundamental no desenvolvimento do "
    "sistema. Conforme Chacon e Straub (2014), o Git permite registrar o histórico de mudanças do "
    "código-fonte, rastrear modificações e possibilitar a colaboração entre desenvolvedores, já "
    "que cada desenvolvedor mantém uma cópia completa do repositório em sua máquina local. O "
    "GitHub, associado ao Git, fornece hospedagem remota do repositório e ferramentas de "
    "colaboração. No Sangalli Gestão, essas ferramentas organizaram a divisão de frentes de "
    "trabalho entre backend, frontend e infraestrutura, conforme detalhado no plano de ação do "
    "grupo."
)
p(
    "Por fim, a hospedagem do sistema em serviços de nuvem — banco de dados, API e front-end "
    "estático — dialoga com o conceito de Computação em Nuvem (Cloud Computing), que, segundo "
    "Laudon e Laudon (2014), permite que empresas de qualquer porte utilizem recursos "
    "computacionais sob demanda, sem a necessidade de manter infraestrutura própria, reduzindo "
    "custos de operação — fator especialmente relevante para uma micro empresa como a Oficina "
    "Funilaria Sangalli. A acessibilidade do sistema também foi orientada por padrões técnicos: "
    "HTML semântico, rótulos (labels) associados a todos os campos, atributos aria-label, foco "
    "visível e indicadores de status que nunca dependem apenas da cor, auditados com a ferramenta "
    "Google Lighthouse, nativa do navegador Chrome."
)
p(
    "A Tabela 3 sintetiza como cada exigência do tema norteador do Projeto Integrador é atendida "
    "pelas tecnologias efetivamente utilizadas no Sangalli Gestão."
)
add_table(
    ["Exigência do tema norteador", "Tecnologia utilizada", "Onde é evidenciada"],
    [
        ["Framework web", "React 18 (front-end) e Express (back-end)",
         "package.json de cada pasta do projeto"],
        ["Banco de dados", "PostgreSQL, hospedado no Supabase, via Prisma ORM",
         "backend/prisma/schema.prisma"],
        ["Script web (JavaScript)", "TypeScript em 100% do front-end e do back-end",
         "tsconfig.json de cada pasta"],
        ["Computação em nuvem",
         "Banco de dados no Supabase (em uso); deploy planejado do front-end no Netlify e "
         "do back-end no Render",
         ".env do backend e netlify.toml do frontend"],
        ["Uso de API",
         "Consumo da API externa ViaCEP (endereço automático) e do Cloudinary (imagens); "
         "API REST própria construída em Express",
         "services/cepService.ts; backend completo"],
        ["Acessibilidade",
         "HTML semântico, labels, aria-label e foco visível, auditados com o Google Lighthouse",
         "componentes de formulário do frontend"],
        ["Controle de versão", "Git e GitHub, com histórico de commits incrementais",
         "repositório do projeto (git log)"],
        ["Testes",
         "Vitest + Supertest no backend (21 testes) e Vitest + React Testing Library no "
         "frontend (24 testes)",
         "backend/tests/ e arquivos *.test.tsx do frontend"],
        ["Análise de dados (opcional)",
         "Painel (dashboard) e Relatórios com indicadores e gráficos (Recharts)",
         "pages/DashboardPage.tsx e pages/ReportsPage.tsx"],
    ],
    "Tabela 3 – Aderência do projeto às exigências do tema norteador do PI",
)

subheading("2.4 Metodologia")
p(
    "O desenvolvimento do Sangalli Gestão adotou uma abordagem iterativa e incremental, "
    "organizada em três etapas principais — ouvir e interpretar o contexto, criar e prototipar, e "
    "implementar e testar —, conduzidas ao longo do cronograma de sete quinzenas definido no "
    "Plano de Ação do Projeto Integrador II."
)

subheading("2.4.1 Ouvir e Interpretar o Contexto")
p(
    "O projeto foi realizado junto à Oficina Funilaria Sangalli, negócio local de prestação de "
    "serviços de funilaria e mecânica automotiva. A escolha da comunidade externa partiu do "
    "mapeamento de pequenos negócios da região que dependiam fortemente de anotações em papel e "
    "processos manuais; entre as opções avaliadas, o grupo optou pela Oficina Funilaria Sangalli "
    "por se tratar de um cenário real, aberto à colaboração, no qual a introdução de ferramentas "
    "de tecnologia e organização de dados poderia gerar impacto prático e imediato no dia a dia "
    "do proprietário."
)
p(
    "A primeira fase consistiu em uma visita e entrevista direta com o proprietário e gestor da "
    "oficina, na qual o grupo observou a rotina de atendimento e levantou os principais processos "
    "manuais: anotações de ordens de serviço em papel, ausência de um cadastro estruturado de "
    "clientes e veículos, controle informal de peças utilizadas e falta de um registro organizado "
    "das movimentações financeiras. Para essa etapa, foram aplicados dois instrumentos de coleta "
    "de dados: uma entrevista estruturada com o proprietário Daniel Sangalli (aplicada por Deise "
    "Vizu da Silva) e uma ficha de percepção respondida por clientes da oficina. A partir dessa "
    "escuta ativa, foram definidos os requisitos funcionais do sistema, que envolvem: cadastro de "
    "clientes e veículos, abertura e acompanhamento de ordens de serviço com histórico de status, "
    "catálogo de serviços e peças, cálculo automático de orçamentos, registro de pagamentos e um "
    "canal de acompanhamento acessível ao cliente sem necessidade de login."
)

subheading("2.4.2 Criar / Prototipar")
p(
    "O desenvolvimento foi iniciado com a definição da arquitetura técnica: React 18 com "
    "TypeScript para o front-end, Tailwind CSS para estilização responsiva e Vite como bundler; "
    "Node.js com Express e TypeScript para o back-end, com Prisma ORM para acesso ao banco de "
    "dados; e PostgreSQL, hospedado no Supabase, como banco de dados relacional. O projeto foi "
    "versionado no GitHub, com divisão de responsabilidades entre as frentes de backend, frontend "
    "e infraestrutura em nuvem, conforme definido no plano de ação da equipe."
)
p(
    "O back-end foi organizado de forma modular, com rotas, controladores, middlewares e "
    "validadores (Zod) separados por domínio — autenticação, clientes, veículos, ordens de "
    "serviço, serviços, peças, relatórios e acompanhamento público. O front-end segue a mesma "
    "lógica de modularidade, com páginas dedicadas (Login, Dashboard, Clientes, Veículos, Ordens "
    "de Serviço, Peças, Serviços, Relatórios, Usuários, Configurações e Acompanhamento Público), "
    "componentes reutilizáveis (cartões de estatística, indicadores de status, formulários) e "
    "contextos de autenticação compartilhados."
)
p(
    "O banco de dados foi modelado com um conjunto de tabelas centrais que representam o domínio "
    "da oficina: clientes, veículos, serviços, peças, ordens de serviço e suas relações (serviços "
    "e peças vinculados a cada ordem), fotos, histórico de status e pagamentos, garantindo "
    "rastreabilidade completa de cada atendimento, da entrada do veículo até a entrega."
)

subheading("2.4.3 Implementar / Testar")
p(
    "A solução vem sendo implementada de forma incremental, com testes automatizados de back-end "
    "(Vitest e Supertest) e de front-end (Vitest e React Testing Library), além de revisão dos "
    "aspectos de segurança da API (Helmet, limitação de requisições, hashing de senhas e "
    "validação de dados de entrada com Zod). A hospedagem planejada segue o modelo front-end "
    "estático (Netlify), API em serviço de nuvem (Render) e banco de dados gerenciado (Supabase, "
    "já em uso), com as credenciais sensíveis mantidas fora do repositório de código. A validação "
    "prática do sistema com o proprietário da oficina será aprofundada nas próximas quinzenas, "
    "com a coleta de devolutivas para orientar os ajustes finais previstos para o relatório final."
)

subheading("2.5 Resultados Preliminares: Solução Inicial")

subheading('2.5.1 Etapa "Ouvir e Interpretar o Contexto"')
p(
    "A etapa de escuta ativa confirmou que a Oficina Funilaria Sangalli não possui, até o "
    "momento, nenhuma ferramenta digital que centralize o controle de clientes, veículos, ordens "
    "de serviço e finanças. Os registros são feitos por meio de anotações manuais em papel e "
    "planilhas desconectadas entre si, o que dificulta tanto o acompanhamento do andamento de "
    "cada serviço quanto a organização financeira da oficina. A Tabela 1 sintetiza as respostas "
    "obtidas na entrevista estruturada aplicada ao proprietário Daniel Sangalli."
)
add_table(
    ["Pergunta", "Resposta"],
    [
        ["Ordens de serviço abertas por semana", "4"],
        ["Forma de registro atual das ordens de serviço", "Papel avulso"],
        ["Tempo diário gasto organizando anotações, buscando dados de clientes ou calculando orçamentos",
         "Cerca de 30 minutos"],
        ["Frequência de dificuldade para localizar informações de cliente/veículo já atendido",
         "Cerca de 50% das vezes"],
        ["Controle de valores recebidos e pendentes", "Anotações em papel e WhatsApp"],
        ["Contato de clientes perguntando sobre o andamento do veículo",
         "Pouco — acompanhamento e fotos já são enviados pelo WhatsApp"],
        ["Utilidade percebida de um sistema digital (escala de 1 a 5)", "5 (muito útil)"],
    ],
    "Tabela 1 – Síntese da entrevista com o proprietário (Daniel Sangalli)",
    source="Elaboração dos autores, com base em entrevista aplicada por Deise Vizu da Silva (2026).",
)
p(
    "Complementarmente, foi aplicada uma ficha de percepção com clientes da oficina, cujas "
    "respostas estão sintetizadas na Tabela 2. A coleta com um número maior de clientes está em "
    "andamento e será ampliada para o relatório final."
)
add_table(
    ["Pergunta", "Resposta assinalada"],
    [
        ["Frequência com que leva o veículo à oficina", "Primeira vez"],
        ["Forma atual de saber do andamento do reparo", "Aviso da oficina por WhatsApp/ligação"],
        ["Dificuldade para saber se o veículo estava pronto ou qual era o valor do orçamento",
         "Raramente"],
        ["Utilidade de um link para acompanhar o status do veículo pelo celular (escala de 1 a 5)",
         "5 (muito útil)"],
        ["Informações mais importantes nesse acompanhamento",
         "Valor do orçamento; previsão de entrega; histórico de serviços já feitos"],
    ],
    "Tabela 2 – Percepção de clientes da oficina",
)
p(
    "A partir dessas respostas, foram priorizados os seguintes requisitos para a solução: (i) um "
    "cadastro estruturado de clientes e veículos, evitando duplicidade e retrabalho no "
    "preenchimento de dados e reduzindo o tempo diário gasto com anotações; (ii) um fluxo claro "
    "de status para cada ordem de serviço, do diagnóstico até a entrega, com histórico "
    "rastreável; (iii) um cálculo automático de orçamento, somando serviços, peças e mão de obra, "
    "reduzindo erros manuais; e (iv) uma página pública de acompanhamento, acessível por link, "
    "que exiba status, previsão de entrega, valor do orçamento e histórico de serviços — item "
    "apontado como o mais valorizado pelos clientes consultados."
)
p(
    "Esses achados reforçam a conexão do projeto com o tema norteador da UNIVESP, ao evidenciar "
    "como a aplicação de conceitos de Tecnologia da Informação e organização de dados pode "
    "transformar processos manuais de uma micro empresa em rotinas digitais, eficientes e "
    "auditáveis."
)

subheading('2.5.2 Etapa "Criar e Prototipar"')
p(
    "A partir dos requisitos levantados, o grupo avaliou diferentes combinações de tecnologias "
    "para o desenvolvimento. A Tabela 4 sintetiza o processo de escolha das principais "
    "ferramentas adotadas."
)
add_table(
    ["Tecnologia", "Vantagens avaliadas", "Motivo da escolha"],
    [
        ["React 18 + TypeScript", "Componentização, tipagem estática, ecossistema amplo",
         "Robustez e facilidade de manutenção a longo prazo"],
        ["Vite + Tailwind CSS", "Build rápido, classes utilitárias, responsividade nativa",
         "Agilidade no desenvolvimento da interface"],
        ["Node.js + Express + Prisma ORM",
         "Produtividade no desenvolvimento de APIs REST, tipagem de ponta a ponta com TypeScript",
         "Integração fluida entre back-end e banco de dados relacional"],
        ["PostgreSQL (Supabase)", "Banco relacional robusto, hospedagem gerenciada, plano gratuito",
         "Custo reduzido e eliminação de infraestrutura de banco própria"],
        ["Netlify (frontend) / Render (backend)",
         "Deploy automático via Git, HTTPS nativo, planos gratuitos",
         "Facilidade de publicação e manutenção contínua"],
    ],
    "Tabela 4 – Comparativo de tecnologias avaliadas",
)
p(
    "O banco de dados foi modelado com tabelas centrais que representam o funcionamento da "
    "oficina, com destaque para a tabela work_orders (ordens de serviço), apresentada na Tabela "
    "5, que concentra as informações de cada atendimento e se relaciona com clientes, veículos, "
    "serviços, peças, fotos, pagamentos e histórico de status."
)
add_table(
    ["Campo", "Tipo", "Descrição"],
    [
        ["id", "uuid", "Identificador único da ordem de serviço"],
        ["number", "inteiro", "Número sequencial exibido ao cliente"],
        ["clientId / vehicleId", "uuid", "Referências ao cliente e ao veículo atendidos"],
        ["problemDescription", "texto", "Descrição do problema relatado"],
        ["diagnosis", "texto", "Diagnóstico técnico registrado pela oficina"],
        ["status", "enum",
         "Situação atual (diagnóstico, aguardando aprovação, manutenção, funilaria, pintura, "
         "teste, pronto, entregue, cancelado)"],
        ["laborCost", "decimal", "Valor de mão de obra"],
        ["publicToken", "uuid", "Token único usado na página pública de acompanhamento"],
    ],
    "Tabela 5 – Estrutura simplificada da tabela work_orders",
)
p(
    "A interface foi organizada em páginas com responsabilidades bem definidas — autenticação, "
    "painel (dashboard), clientes, veículos, ordens de serviço, catálogo de serviços e peças, "
    "relatórios, usuários, configurações e a página pública de acompanhamento —, todas consumindo "
    "a API REST do back-end por meio de um serviço HTTP centralizado no front-end."
)
note = p(
    "(Inserir aqui prints atualizados das telas de Login, Dashboard, Ordens de Serviço e da "
    "Página Pública de Acompanhamento, com legendas no padrão \"Figura X – Tela [nome]\", "
    "conforme exigido pelo template — e criar a Lista de Ilustrações correspondente.)",
    size=11, italic=True,
)

subheading('2.5.3 Etapa "Implementar e Testar"')
p(
    "A Tabela 6 apresenta o status de implementação das funcionalidades planejadas até esta fase "
    "do projeto."
)
add_table(
    ["Funcionalidade", "Status", "Observação"],
    [
        ["Autenticação de usuários (JWT)", "Implementada", "Login de administradores da oficina"],
        ["Cadastro de clientes com busca automática de endereço (ViaCEP)", "Implementada",
         "Reduz erros de digitação e retrabalho"],
        ["Cadastro de veículos vinculados a clientes", "Implementada",
         "Um cliente pode ter vários veículos"],
        ["Ordens de serviço com fluxo de status", "Implementada",
         "Diagnóstico → aprovação → manutenção/funilaria/pintura → teste → pronto → entregue"],
        ["Linha do tempo (histórico) de cada ordem de serviço", "Implementada",
         "Registra usuário responsável e data/hora de cada mudança"],
        ["Catálogo de serviços e peças", "Implementada",
         "Base para o cálculo automático de orçamento"],
        ["Cálculo automático de orçamento (serviços + peças + mão de obra)", "Implementada",
         "Reduz erros manuais de precificação"],
        ["Registro de pagamentos e saldo restante", "Implementada",
         "Controle financeiro por ordem de serviço"],
        ["Upload de fotos do veículo (entrada, durante, finalização)", "Implementada",
         "Armazenamento via Cloudinary"],
        ["Página pública de acompanhamento (sem login)", "Implementada",
         "Acesso por link exclusivo ou QR Code"],
        ["Painel (dashboard) com indicadores e gráficos", "Implementada",
         "Faturamento mensal, ordens por status, serviços mais realizados"],
        ["Relatórios com filtros por período e status", "Implementada",
         "Faturamento, ticket médio, tempo médio de serviço"],
        ["Testes automatizados (backend e frontend)", "Implementada",
         "45 testes — Vitest, Supertest e React Testing Library, todos passando"],
        ["Auditoria de acessibilidade (Google Lighthouse)", "Em andamento",
         "Páginas públicas via PageSpeed Insights; páginas internas via Lighthouse local"],
        ["Migração do banco de dados para o Supabase (PostgreSQL)", "Implementada",
         "Ambiente de desenvolvimento já aponta para o Supabase"],
        ["Publicação em ambiente de produção (deploy)", "Em andamento",
         "Front-end no Netlify e back-end no Render"],
        ["Validação final da solução com o proprietário da oficina", "Em andamento",
         "Prevista para as próximas quinzenas, com coleta de devolutivas"],
    ],
    "Tabela 6 – Funcionalidades do sistema e status de implementação",
)
p(
    "Os primeiros retornos obtidos junto ao proprietário da oficina, durante as visitas de "
    "acompanhamento do desenvolvimento, indicam boa aceitação da proposta, sobretudo em relação à "
    "possibilidade de acompanhar o status de cada ordem de serviço em um único lugar e de "
    "calcular orçamentos automaticamente. As próximas etapas do projeto envolvem a auditoria de "
    "acessibilidade com PageSpeed Insights e Lighthouse, a publicação do sistema em ambiente de "
    "produção e uma nova rodada de validação prática com o proprietário, cujos resultados serão "
    "detalhados no relatório final."
)

# ================= REFERÊNCIAS =================
heading("Referências", new_page=True)
refs = [
    "CHACON, Scott; STRAUB, Ben. Pro Git. 2. ed. Nova York: Apress, 2014. Disponível em: "
    "https://git-scm.com/book/en/v2. Acesso em: 01 set. 2026.",
    "CLOUDINARY. Cloudinary documentation: image and video API platform. Documentação oficial. "
    "2026. Disponível em: https://cloudinary.com/documentation. Acesso em: 01 set. 2026.",
    "GOOGLE. Introduction to Lighthouse. Chrome for Developers. 2026. Disponível em: "
    "https://developer.chrome.com/docs/lighthouse/overview/. Acesso em: 01 set. 2026.",
    "LAUDON, Kenneth C.; LAUDON, Jane P. Sistemas de informação gerenciais. 11. ed. São Paulo: "
    "Pearson Education do Brasil, 2014.",
    "META PLATFORMS. React: a biblioteca JavaScript para criar interfaces de usuário. "
    "Documentação oficial. 2026. Disponível em: https://react.dev. Acesso em: 01 set. 2026.",
    "MICROSOFT. TypeScript: JavaScript with syntax for types. Documentação oficial. 2026. "
    "Disponível em: https://www.typescriptlang.org/docs. Acesso em: 01 set. 2026.",
    "PRESSMAN, Roger S.; MAXIM, Bruce R. Engenharia de software: uma abordagem profissional. 9. "
    "ed. Porto Alegre: AMGH, 2021.",
    "PRISMA DATA. Prisma ORM documentation. Documentação oficial. 2026. Disponível em: "
    "https://www.prisma.io/docs. Acesso em: 01 set. 2026.",
    "SILBERSCHATZ, Abraham; KORTH, Henry F.; SUDARSHAN, S. Sistema de banco de dados. 7. ed. Rio "
    "de Janeiro: GEN LTC, 2020.",
    "SUPABASE INC. Supabase documentation: the open source Firebase alternative. Documentação "
    "oficial. 2026. Disponível em: https://supabase.com/docs. Acesso em: 01 set. 2026.",
    "TAILWIND LABS. Tailwind CSS: documentação oficial. 2026. Disponível em: "
    "https://tailwindcss.com/docs. Acesso em: 01 set. 2026.",
    "VIACEP. Consulta de CEP: webservice gratuito de endereços do Brasil. 2026. Disponível em: "
    "https://viacep.com.br. Acesso em: 01 set. 2026.",
    "VITE. Vite: next generation frontend tooling. Documentação oficial. 2026. Disponível em: "
    "https://vite.dev/guide. Acesso em: 01 set. 2026.",
    "ZOD. Zod: TypeScript-first schema validation. Documentação oficial. 2026. Disponível em: "
    "https://zod.dev. Acesso em: 01 set. 2026.",
]
for r in refs:
    para = doc.add_paragraph()
    para.paragraph_format.line_spacing = 1.0
    para.paragraph_format.space_after = Pt(12)
    para.paragraph_format.first_line_indent = 0
    run = para.add_run(r)
    run.font.name = "Times New Roman"
    run.font.size = Pt(12)

out_path = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Geovane\Desktop\AutoControl\docs\RELATORIO_PARCIAL.docx"
doc.save(out_path)
print(f"OK - gerado {out_path}")
