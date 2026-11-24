# 2. Layout das telas e lista de eventos

Todas as telas seguem o mesmo layout: **menu lateral** (logo, navegação, usuário logado com perfil e botão Sair) e **área principal** (barra superior com caminho e data + conteúdo). Tema escuro com cor de destaque verde-limão. Em telas pequenas o menu vira uma gaveta aberta pelo botão ☰.

## Telas

### Login
Dividida em duas colunas: à esquerda, foto e chamada do sistema; à direita, logo, campos **Usuário** e **Senha**, botão **Entrar** e caixa com os usuários de demonstração.

### Visão geral (painel)
- Banner de boas-vindas com atalhos (Nova matrícula, Ver alunos).
- 4 indicadores animados: alunos, planos, matrículas ativas e receita mensal.
- Gráfico de barras: novas matrículas nos últimos 6 meses.
- Gráfico de rosca: matrículas ativas por plano.
- Listas: matrículas recentes e vencimentos dos próximos 7 dias.

### Alunos
Cabeçalho com **Exportar** e **Novo aluno**; busca por nome/CPF/e-mail; filtros (Todos · Com plano · Sem plano); tabela com aluno, CPF, telefone, plano atual e ações (ver ficha, editar, excluir*).

### Ficha do aluno (painel lateral)
Avatar, nome, data de cadastro, plano atual, CPF, idade, telefone, e-mail, total de matrículas, valor em planos, linha do tempo das matrículas e botão **Matricular**.

### Planos
Cartões com nome, preço mensal, duração, descrição e número de alunos ativos; selo "Mais popular"; botões **Novo plano***, editar* e excluir*.

### Matrículas
Cabeçalho com **Exportar** e **Nova matrícula**; filtros (Todas · Ativas · Vencidas · Canceladas); tabela com aluno, plano, período, barra de progresso até o vencimento, valor, situação e ações (renovar, cancelar*).

### Equipe* (somente admin)
Explicação das permissões, tabela de usuários (nome, usuário, perfil) e botões **Novo usuário** e remover.

\* oculto para o perfil Recepção.

### Componentes comuns
Formulário em janela modal (com máscaras de CPF e telefone), janela de confirmação, notificações (toasts), carregamento em esqueleto e estados vazios.

## Lista de eventos

| # | Tela | Evento (ação do usuário) | Resposta do sistema | Serviço chamado |
|---|---|---|---|---|
| E1 | Abrir o site | — | Se houver sessão, abre o painel; senão, mostra o login | `GET /api/me` |
| E2 | Login | Clicar em **Entrar** | Valida e abre o painel; em erro, mostra mensagem | `POST /api/login` |
| E3 | Menu | Clicar em **Sair** → confirmar | Encerra a sessão e volta ao login | `POST /api/logout` |
| E4 | Menu | Clicar em um item | Troca de tela (rota `#hash`) e atualiza contadores | `GET /api/dashboard` + listagem da tela |
| E5 | Painel | Abrir a tela | Carrega indicadores, gráficos e listas | `GET /api/dashboard` |
| E6 | Alunos | Digitar na busca / clicar em filtro | Filtra a tabela na hora | — (local) |
| E7 | Alunos | **Novo aluno** → Salvar | Cadastra e atualiza a lista | `POST /api/alunos` |
| E8 | Alunos | Editar → Salvar | Atualiza o aluno | `PUT /api/alunos/:id` |
| E9 | Alunos | Excluir → confirmar | Remove o aluno e suas matrículas | `DELETE /api/alunos/:id` |
| E10 | Alunos / Matrículas | Clicar no nome ou no ícone de olho | Abre a ficha do aluno | `GET /api/alunos/:id` |
| E11 | Ficha | **Matricular** | Vai para Matrículas com o aluno já selecionado | `GET /api/alunos`, `GET /api/planos` |
| E12 | Alunos / Matrículas | **Exportar** | Baixa um arquivo `.csv` | — (gerado no navegador) |
| E13 | Planos | **Novo plano** / editar → Salvar | Cria ou atualiza o plano | `POST /api/planos` · `PUT /api/planos/:id` |
| E14 | Planos | Excluir → confirmar | Remove; se houver matrículas, avisa que não pode | `DELETE /api/planos/:id` |
| E15 | Matrículas | **Nova matrícula** → Salvar | Cria a matrícula com vencimento calculado | `POST /api/matriculas` |
| E16 | Matrículas | Renovar → confirmar | Estende o vencimento e reativa | `PUT /api/matriculas/:id/renovar` |
| E17 | Matrículas | Cancelar → confirmar | Marca como cancelada | `PUT /api/matriculas/:id/cancelar` |
| E18 | Equipe | **Novo usuário** → Salvar | Cria o usuário com o perfil escolhido | `POST /api/usuarios` |
| E19 | Equipe | Remover → confirmar | Remove o acesso | `DELETE /api/usuarios/:id` |
| E20 | Qualquer | Sessão expirada (resposta 401) | Volta para o login | — |
