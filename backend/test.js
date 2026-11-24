// Testes formais dos serviços (node:test) - rode com: node --test
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { criarServidor } = require('./server');

let servidor, base, cookie = '';
const api = async (metodo, rota, corpo) => {
  const r = await fetch(base + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  const setCookie = r.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  return { status: r.status, dados: await r.json() };
};

before(async () => {
  servidor = criarServidor(':memory:');
  await new Promise((ok) => servidor.listen(0, ok));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

test('bloqueia acesso sem login', async () => {
  assert.strictEqual((await api('GET', '/api/alunos')).status, 401);
});

test('recusa senha errada', async () => {
  assert.strictEqual((await api('POST', '/api/login', { usuario: 'admin', senha: 'errada' })).status, 401);
});

test('faz login com admin', async () => {
  const r = await api('POST', '/api/login', { usuario: 'admin', senha: 'academia123' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.dados.perfil, 'admin');
});

test('cadastra, edita e exclui aluno', async () => {
  const novo = await api('POST', '/api/alunos', { nome: 'Teste', cpf: '999.999.999-99' });
  assert.strictEqual(novo.status, 201);
  const edit = await api('PUT', `/api/alunos/${novo.dados.id}`, { nome: 'Teste Editado', cpf: '999.999.999-99' });
  assert.strictEqual(edit.dados.nome, 'Teste Editado');
  assert.strictEqual((await api('DELETE', `/api/alunos/${novo.dados.id}`)).status, 200);
});

test('não aceita CPF duplicado', async () => {
  const r = await api('POST', '/api/alunos', { nome: 'Outro', cpf: '111.222.333-44' });
  assert.strictEqual(r.status, 400);
});

test('valida campos obrigatórios', async () => {
  assert.strictEqual((await api('POST', '/api/planos', { nome: 'Sem preço' })).status, 400);
});

test('matrícula calcula data de fim e valor pelo plano', async () => {
  const r = await api('POST', '/api/matriculas', { aluno_id: 3, plano_id: 2, inicio: '2026-01-10' });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(r.dados.fim, '2026-04-10');
  assert.strictEqual(r.dados.valor, 89.9);
});

test('cancela e renova matrícula', async () => {
  const nova = await api('POST', '/api/matriculas', { aluno_id: 3, plano_id: 1 });
  assert.strictEqual((await api('PUT', `/api/matriculas/${nova.dados.id}/cancelar`)).status, 200);
  const ren = await api('PUT', `/api/matriculas/${nova.dados.id}/renovar`);
  assert.strictEqual(ren.dados.status, 'ativa');
});

test('não exclui plano com matrículas', async () => {
  assert.strictEqual((await api('DELETE', '/api/planos/3')).status, 409);
});

test('dashboard retorna os indicadores', async () => {
  const r = await api('GET', '/api/dashboard');
  assert.ok(r.dados.alunos >= 3);
  assert.ok('receita' in r.dados && Array.isArray(r.dados.recentes));
});

test('dashboard traz dados dos gráficos (6 meses e planos)', async () => {
  const r = await api('GET', '/api/dashboard');
  assert.strictEqual(r.dados.porMes.length, 6);
  assert.ok(r.dados.porMes.every((m) => /^\d{4}-\d{2}$/.test(m.mes) && m.total >= 0));
  assert.ok(r.dados.porPlano.length >= 3);
});

test('ficha do aluno traz o histórico de matrículas', async () => {
  const r = await api('GET', '/api/alunos/1');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.dados.nome, 'Ana Souza');
  assert.ok(Array.isArray(r.dados.matriculas) && r.dados.matriculas.length >= 1);
  assert.strictEqual((await api('GET', '/api/alunos/9999')).status, 404);
});

test('lista de alunos informa o plano atual e planos informam ativos', async () => {
  const alunos = (await api('GET', '/api/alunos')).dados;
  assert.ok(alunos.some((a) => a.plano_atual));
  const planos = (await api('GET', '/api/planos')).dados;
  assert.ok(planos.every((p) => typeof p.ativos === 'number'));
});

test('autorização: recepção cadastra aluno, mas não exclui nem mexe em planos', async () => {
  await api('POST', '/api/logout');
  assert.strictEqual((await api('POST', '/api/login', { usuario: 'recepcao', senha: 'recepcao123' })).dados.perfil, 'recepcao');
  const novo = await api('POST', '/api/alunos', { nome: 'Teste Recepção', cpf: '999.888.777-66' });
  assert.strictEqual(novo.status, 201);
  assert.strictEqual((await api('DELETE', `/api/alunos/${novo.dados.id}`)).status, 403);
  assert.strictEqual((await api('POST', '/api/planos', { nome: 'X', preco: 1, duracao_meses: 1 })).status, 403);
  assert.strictEqual((await api('GET', '/api/usuarios')).status, 403);
  await api('POST', '/api/logout');
  await api('POST', '/api/login', { usuario: 'admin', senha: 'academia123' });
});

test('admin gerencia a equipe (cria e exclui usuário)', async () => {
  const u = await api('POST', '/api/usuarios', { nome: 'Novo Func', usuario: 'func1', senha: '123456', perfil: 'recepcao' });
  assert.strictEqual(u.status, 201);
  assert.strictEqual((await api('POST', '/api/usuarios', { nome: 'Dup', usuario: 'func1', senha: '123456', perfil: 'recepcao' })).status, 409);
  assert.strictEqual((await api('DELETE', `/api/usuarios/${u.dados.id}`)).status, 200);
});
