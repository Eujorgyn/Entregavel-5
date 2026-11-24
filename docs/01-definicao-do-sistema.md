# 1. Definição do sistema

**Disciplina:** N389 — Ambientes de Desenvolvimento de Software · UNIFOR
**Integrante:** Jorge Gabriel
**Sistema:** **FitGo** — gestão de academia (alunos, planos e matrículas)
**Aplicação no ar:** http://32.200.104.4 · **Código:** https://github.com/Eujorgyn/Entregavel-5

## Problema

Academias pequenas costumam controlar alunos e mensalidades em cadernos ou planilhas soltas. Fica difícil saber quem está com o plano em dia, quem vence esta semana e quanto entra por mês.

## Objetivo

Oferecer um painel web, simples e rápido, para a equipe da academia cadastrar alunos, definir planos, controlar matrículas (início, vencimento, renovação e cancelamento) e acompanhar indicadores, com controle de acesso por perfil.

## Funcionalidades (transações)

Uma transação é uma ação executada por um usuário que altera ou consulta dados do sistema. O requisito para equipe individual é de **6 transações**; o FitGo implementa **15**.

| # | Transação | Quem pode |
|---|---|---|
| T1 | Entrar no sistema (login) | Todos |
| T2 | Sair do sistema (logout) | Todos |
| T3 | Cadastrar aluno | Admin, Recepção |
| T4 | Editar aluno | Admin, Recepção |
| T5 | Excluir aluno | Admin |
| T6 | Consultar ficha do aluno (dados + histórico) | Admin, Recepção |
| T7 | Criar plano | Admin |
| T8 | Editar plano | Admin |
| T9 | Excluir plano (bloqueado se tiver matrículas) | Admin |
| T10 | Matricular aluno em um plano | Admin, Recepção |
| T11 | Renovar matrícula | Admin, Recepção |
| T12 | Cancelar matrícula | Admin |
| T13 | Exportar alunos / matrículas em CSV | Admin, Recepção |
| T14 | Criar usuário da equipe | Admin |
| T15 | Remover usuário da equipe | Admin |

Consultas de apoio: painel com indicadores e gráficos, listagens com busca e filtros.

## Regras de negócio

- CPF do aluno é único.
- A data de vencimento da matrícula é calculada: `início + duração do plano (meses)`.
- O valor da matrícula é copiado do preço do plano no momento da matrícula (mudar o preço depois não altera matrículas antigas).
- Renovar estende a partir do vencimento atual (ou de hoje, se já venceu) e reativa a matrícula.
- Situação exibida: **ativa** (dentro do prazo), **vencida** (passou do fim) ou **cancelada**.
- Plano com matrículas não pode ser excluído.
- Ninguém pode excluir o próprio usuário.

## Requisitos não funcionais (exigidos no Desafio Final)

| Requisito | Como foi atendido |
|---|---|
| Frontend: HTML, CSS, JavaScript | SPA em JavaScript puro, sem framework (`frontend/`) |
| Backend: Node JS, Web Service REST, rotas | Node.js 22, API REST com roteador próprio (`backend/server.js`) |
| Controle de acesso (autenticação e autorização) | Login com senha em hash `scrypt`, sessão em cookie `HttpOnly`; perfis **admin** e **recepção** com bloqueio no servidor (HTTP 403) |
| SGBD | SQLite (`node:sqlite`) |
| Controle de versão | Git + GitHub |
| Testes formais nos serviços | 15 testes com `node:test`, executados automaticamente no GitHub Actions |

## Ambientes de desenvolvimento utilizados

| Ambiente | Ferramenta |
|---|---|
| Desenvolvimento | Editor de código + Node.js 22 |
| Banco de dados | SQLite |
| Testes | `node:test` (serviços) e navegador automatizado (telas) |
| Versionamento e integração contínua | Git, GitHub e GitHub Actions |
| Execução / servidor web | AWS EC2 (Amazon Linux 2023) com serviço `systemd`; alternativa em Docker |
| Design | Tema próprio (CSS), logo gerado com Google Gemini e vetorizado em SVG |
