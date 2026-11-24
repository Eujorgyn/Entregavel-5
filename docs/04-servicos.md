# 4. Especificação dos serviços (API REST)

- **Base:** `http://32.200.104.4` · formato **JSON** (`Content-Type: application/json`).
- **Autenticação:** após o login o servidor envia o cookie `sessao` (`HttpOnly`, 8 horas). Todas as rotas, exceto `POST /api/login`, `POST /api/logout` e `GET /health`, exigem esse cookie.
- **Autorização:** rotas marcadas com 🔒 exigem perfil `admin`.
- **Erros:** sempre `{ "erro": "mensagem" }`.

| Código | Quando |
|---|---|
| 200 / 201 | Sucesso / criado |
| 400 | Dados inválidos ou faltando (`Preencha: nome, cpf`), CPF duplicado |
| 401 | Não logado ou senha errada |
| 403 | Perfil sem permissão |
| 404 | Registro ou rota não encontrados |
| 409 | Conflito (plano com matrículas, usuário já existe) |

---

## Autenticação

### `POST /api/login`
| | |
|---|---|
| **Entrada** | `{ "usuario": "admin", "senha": "academia123" }` |
| **Saída 200** | `{ "nome": "Administrador", "perfil": "admin" }` + cookie `sessao` |
| **Erros** | 401 usuário ou senha inválidos |

### `POST /api/logout`
Entrada: nenhuma · Saída 200: `{ "ok": true }` (apaga a sessão e o cookie).

### `GET /api/me`
Saída 200: `{ "id": 1, "nome": "Administrador", "usuario": "admin", "perfil": "admin" }` · 401 se não logado.

---

## Painel

### `GET /api/dashboard`
**Saída 200:**
```json
{
  "alunos": 12, "planos": 4, "ativas": 9, "receita": 834.1,
  "vencendo": [{ "id": 2, "aluno": "Bruno Lima", "plano": "Mensal", "fim": "2026-11-29" }],
  "recentes": [{ "id": 11, "aluno": "Ana Souza", "plano": "Anual", "inicio": "2026-11-24", "valor": 69.9, "status": "ativa" }],
  "porMes":   [{ "mes": "2026-06", "total": 2, "valor": 189.8 }],
  "porPlano": [{ "plano": "Mensal", "total": 3 }]
}
```

---

## Alunos

| Método e rota | Entrada | Saída |
|---|---|---|
| `GET /api/alunos` | — | 200: lista de alunos, cada um com `plano_atual` (ou `null`) |
| `GET /api/alunos/:id` | id na URL | 200: aluno + `matriculas: [...]` (histórico) · 404 |
| `POST /api/alunos` | `{ nome*, cpf*, telefone, email, nascimento }` | 201: aluno criado · 400 campos/CPF duplicado |
| `PUT /api/alunos/:id` | mesmos campos | 200: aluno atualizado · 404 |
| `DELETE /api/alunos/:id` 🔒 | — | 200 `{ ok: true }` (apaga também as matrículas) · 404 |

Exemplo de aluno:
```json
{ "id": 1, "nome": "Ana Souza", "cpf": "111.222.333-44", "telefone": "(85) 98000-1000",
  "email": "ana@email.com", "nascimento": "2001-03-15", "criado_em": "2026-11-24", "plano_atual": "Anual" }
```

---

## Planos

| Método e rota | Entrada | Saída |
|---|---|---|
| `GET /api/planos` | — | 200: lista ordenada por preço, com `ativos` (nº de matrículas ativas) |
| `POST /api/planos` 🔒 | `{ nome*, preco*, duracao_meses*, descricao }` | 201: plano criado |
| `PUT /api/planos/:id` 🔒 | mesmos campos | 200: plano atualizado · 404 |
| `DELETE /api/planos/:id` 🔒 | — | 200 · **409** se o plano tiver matrículas · 404 |

---

## Matrículas

| Método e rota | Entrada | Saída |
|---|---|---|
| `GET /api/matriculas` | — | 200: lista (mais recentes primeiro), com nomes do aluno e do plano |
| `POST /api/matriculas` | `{ aluno_id*, plano_id*, inicio }` (`inicio` padrão = hoje) | 201: matrícula com `fim` = início + duração e `valor` = preço do plano · 400 aluno/plano inválido |
| `PUT /api/matriculas/:id/renovar` | — | 200: `fim` estendido a partir do vencimento (ou de hoje), `status` = `ativa` · 404 |
| `PUT /api/matriculas/:id/cancelar` 🔒 | — | 200 `{ ok: true }` · 404 |

Exemplo de matrícula:
```json
{ "id": 11, "aluno_id": 1, "plano_id": 3, "inicio": "2026-11-24", "fim": "2027-11-24",
  "valor": 69.9, "status": "ativa", "aluno": "Ana Souza", "plano": "Anual" }
```

---

## Equipe (usuários)

| Método e rota | Entrada | Saída |
|---|---|---|
| `GET /api/usuarios` 🔒 | — | 200: `[{ id, nome, usuario, perfil }]` (sem senha) |
| `POST /api/usuarios` 🔒 | `{ nome*, usuario*, senha* (mín. 6), perfil* ("admin" \| "recepcao") }` | 201: usuário criado · 400 · 409 usuário já existe |
| `DELETE /api/usuarios/:id` 🔒 | — | 200 · 400 ao tentar excluir a si mesmo · 404 |

---

## Saúde do servidor

### `GET /health` (pública)
Saída 200: `{ "status": "ok", "uptime": "592s" }`

---

## Testes formais

Os serviços são cobertos por **15 testes** em `backend/test.js` (`node:test`), executados com `npm test` e automaticamente no **GitHub Actions** a cada envio ao repositório. Cobrem: bloqueio sem login, senha errada, login, CRUD de alunos, CPF duplicado, campos obrigatórios, cálculo da matrícula, renovação e cancelamento, regra de exclusão de plano, painel e gráficos, ficha do aluno, autorização da recepção (403) e gestão da equipe.
