# FitGo 🏋️ — Sistema de Gestão de Academia

**Disciplina:** N389 — Ambientes de Desenvolvimento de Software · UNIFOR
**Entregável #5:** Aplicação Web rodando na Nuvem (AWS EC2)

🔗 **Aplicação em operação:** http://32.200.104.4
🔑 **Acesso de demonstração:** usuário `admin` · senha `academia123`

---

## 📌 Sobre o sistema

O **FitGo** é um painel administrativo para academias. Com ele, o administrador gerencia **alunos**, **planos** e **matrículas**, e acompanha os principais números do negócio em uma visão geral.

### Funcionalidades (transações)

| # | Funcionalidade |
|---|---|
| 1 | Login e logout com sessão (autenticação) |
| 2 | Cadastrar, editar, excluir e buscar **alunos** |
| 3 | Criar, editar e excluir **planos** (com bloqueio de exclusão se houver matrículas) |
| 4 | **Matricular** aluno em um plano (data de vencimento e valor calculados automaticamente) |
| 5 | **Renovar** matrícula |
| 6 | **Cancelar** matrícula |
| 7 | **Painel**: total de alunos, matrículas ativas, receita mensal, matrículas recentes e vencimentos dos próximos 7 dias |

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | HTML · CSS · JavaScript (SPA, sem framework) |
| Backend | Node.js 22 · API REST (módulo `http` nativo, rotas próprias) |
| Banco de dados | **SQLite** (`node:sqlite`, nativo do Node 22) |
| Segurança | Senhas com hash `scrypt` + salt · sessão via cookie `HttpOnly` · rotas protegidas |
| Testes | `node:test` — 10 testes automatizados dos serviços |
| Nuvem | AWS EC2 (t3.micro, Amazon Linux 2023) + systemd |

## 📁 Estrutura

```
├── backend/
│   ├── server.js      # API REST: rotas, autenticação, servidor de arquivos estáticos
│   ├── db.js          # banco SQLite: tabelas, dados iniciais, hash de senha
│   ├── test.js        # testes formais dos serviços
│   └── package.json
├── frontend/
│   ├── index.html     # login + painel administrativo
│   ├── style.css      # visual (tema escuro)
│   └── script.js      # consome a API e monta as telas
├── user-data.sh       # script de implantação na EC2
└── README.md
```

## 🗄️ Banco de dados

| Tabela | Campos principais |
|---|---|
| `usuarios` | nome, usuário, senha (hash), perfil |
| `sessoes` | token, usuário |
| `alunos` | nome, CPF (único), telefone, e-mail, nascimento |
| `planos` | nome, preço mensal, duração (meses), descrição |
| `matriculas` | aluno, plano, início, fim, valor, status (ativa/cancelada) |

## 🔀 API REST

Todas as rotas (exceto login e `/health`) exigem estar logado.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/login` | Autentica e cria sessão |
| `POST` | `/api/logout` | Encerra a sessão |
| `GET` | `/api/dashboard` | Indicadores do painel |
| `GET` `POST` | `/api/alunos` | Lista / cadastra alunos |
| `PUT` `DELETE` | `/api/alunos/:id` | Edita / exclui aluno |
| `GET` `POST` | `/api/planos` | Lista / cria planos |
| `PUT` `DELETE` | `/api/planos/:id` | Edita / exclui plano |
| `GET` `POST` | `/api/matriculas` | Lista / cria matrículas |
| `PUT` | `/api/matriculas/:id/renovar` | Renova matrícula |
| `PUT` | `/api/matriculas/:id/cancelar` | Cancela matrícula |
| `GET` | `/health` | Status do servidor |

## 🧪 Testes

```bash
cd backend
node --test test.js
```

Cobrem: bloqueio sem login, senha errada, login, CRUD de alunos, CPF duplicado, campos obrigatórios, cálculo da matrícula, cancelamento/renovação, regra de exclusão de plano e o painel.

## 💻 Rodando localmente

Requer **Node.js 22+** (não há dependências externas):

```bash
cd backend
npm run dev      # http://localhost:3000
```

## ☁️ Implantação na AWS

1. Instância **EC2** `t3.micro` (nível gratuito), Amazon Linux 2023, região `us-east-1`.
2. **Grupo de segurança** liberando apenas a porta **80 (HTTP)**.
3. O script `user-data.sh` instala o Node.js 22, baixa este repositório e registra o sistema como **serviço do systemd** (inicia sozinho e reinicia em caso de falha).
4. Acesso pelo **IP público** da instância.

Modelo de serviço: **IaaS** — a AWS fornece a máquina virtual e toda a configuração é feita por nós.
