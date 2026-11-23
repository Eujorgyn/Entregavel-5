// Frontend do FitGo - consome a API REST do backend
const $ = (s) => document.querySelector(s);
const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (d) => (d ? d.split('-').reverse().join('/') : '—');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hoje = () => new Date().toISOString().slice(0, 10);

async function api(metodo, rota, corpo) {
  const r = await fetch(rota, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: corpo ? JSON.stringify(corpo) : undefined });
  const dados = await r.json().catch(() => ({}));
  if (r.status === 401 && rota !== '/api/login') { mostrarLogin(); throw new Error(dados.erro); }
  if (!r.ok) throw new Error(dados.erro || 'Erro');
  return dados;
}

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2200);
}

// ---------- Login ----------
function mostrarLogin() { $('#app').classList.add('hidden'); $('#tela-login').classList.remove('hidden'); }
function mostrarApp(u) {
  $('#tela-login').classList.add('hidden'); $('#app').classList.remove('hidden');
  $('#nome-usuario').textContent = u.nome; $('#avatar').textContent = u.nome[0];
  rotear();
}
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    const u = await api('POST', '/api/login', { usuario: f.get('usuario'), senha: f.get('senha') });
    $('#erro-login').textContent = ''; mostrarApp(u);
  } catch (err) { $('#erro-login').textContent = err.message; }
});
$('#sair').addEventListener('click', async () => { await api('POST', '/api/logout'); mostrarLogin(); });

// ---------- Modal genérico ----------
function abrirModal(titulo, campos, valores, aoSalvar) {
  $('#modal-titulo').textContent = titulo;
  $('#erro-modal').textContent = '';
  $('#modal-campos').innerHTML = campos.map((c) => {
    const v = valores?.[c.nome] ?? c.padrao ?? '';
    if (c.opcoes) return `<label>${c.rotulo}<select name="${c.nome}" ${c.obrig ? 'required' : ''}>
      ${c.opcoes.map((o) => `<option value="${o.v}" ${String(o.v) === String(v) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}</select></label>`;
    return `<label>${c.rotulo}<input name="${c.nome}" type="${c.tipo || 'text'}" ${c.tipo === 'number' ? 'step="any" min="0"' : ''}
      value="${esc(v)}" ${c.obrig ? 'required' : ''} placeholder="${c.ph || ''}"></label>`;
  }).join('');
  const modal = $('#modal');
  $('#salvar').onclick = async (e) => {
    e.preventDefault();
    const form = $('#form-modal');
    if (!form.reportValidity()) return;
    try { await aoSalvar(Object.fromEntries(new FormData(form))); modal.close(); }
    catch (err) { $('#erro-modal').textContent = err.message; }
  };
  modal.showModal();
}

// ---------- Telas ----------
const telas = {
  async painel() {
    const d = await api('GET', '/api/dashboard');
    $('#view').innerHTML = `
      <div class="hero"><div><p class="eyebrow">FitGo · Gestão de academia</p><h3>Treino em dia, gestão em ordem.</h3>
        <p class="muted">Acompanhe alunos, planos e matrículas em um só lugar.</p><br>
        <a class="btn primary" href="#matriculas">Ver matrículas →</a></div><div class="emoji">🏋️</div></div>
      <div class="cards">
        <div class="card"><div class="rotulo">Alunos cadastrados</div><div class="valor">${d.alunos}</div></div>
        <div class="card"><div class="rotulo">Matrículas ativas</div><div class="valor">${d.ativas}</div></div>
        <div class="card"><div class="rotulo">Planos disponíveis</div><div class="valor">${d.planos}</div></div>
        <div class="card"><div class="rotulo">Receita mensal ativa</div><div class="valor">${brl(d.receita)}</div></div>
      </div>
      <div class="grid2">
        <div class="box"><h4>📝 Matrículas recentes</h4>${d.recentes.length ? `<table class="mini">${d.recentes.map((m) =>
          `<tr><td>${esc(m.aluno)}</td><td class="muted">${esc(m.plano)}</td><td><span class="badge ${m.status}">${m.status}</span></td></tr>`).join('')}</table>` : '<p class="vazio">Nenhuma matrícula</p>'}</div>
        <div class="box"><h4>⏰ Vencendo nos próximos 7 dias</h4>${d.vencendo.length ? `<table class="mini">${d.vencendo.map((m) =>
          `<tr><td>${esc(m.aluno)}</td><td class="muted">${esc(m.plano)}</td><td>${dataBR(m.fim)}</td></tr>`).join('')}</table>` : '<p class="vazio">Nada vencendo 🎉</p>'}</div>
      </div>`;
  },

  async alunos() {
    const lista = await api('GET', '/api/alunos');
    const campos = [
      { nome: 'nome', rotulo: 'Nome completo', obrig: true },
      { nome: 'cpf', rotulo: 'CPF', obrig: true, ph: '000.000.000-00' },
      { nome: 'telefone', rotulo: 'Telefone', ph: '(85) 90000-0000' },
      { nome: 'email', rotulo: 'E-mail', tipo: 'email' },
      { nome: 'nascimento', rotulo: 'Data de nascimento', tipo: 'date' }
    ];
    const form = (a) => abrirModal(a ? 'Editar aluno' : 'Novo aluno', campos, a, async (v) => {
      await api(a ? 'PUT' : 'POST', a ? `/api/alunos/${a.id}` : '/api/alunos', v);
      toast(a ? 'Aluno atualizado' : 'Aluno cadastrado'); telas.alunos();
    });
    botaoNovo(() => form());
    $('#view').innerHTML = `<input class="busca" id="busca" placeholder="🔎 Buscar aluno...">
      <table class="tabela"><thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th></th></tr></thead>
      <tbody>${lista.map((a) => `<tr data-busca="${esc((a.nome + a.cpf).toLowerCase())}"><td>${esc(a.nome)}</td><td>${esc(a.cpf)}</td><td>${esc(a.telefone)}</td><td>${esc(a.email)}</td>
        <td class="acoes"><button class="btn sm" data-ed="${a.id}">Editar</button> <button class="btn sm danger" data-del="${a.id}">Excluir</button></td></tr>`).join('')
        || '<tr><td colspan="5" class="vazio">Nenhum aluno</td></tr>'}</tbody></table>`;
    $('#busca').oninput = (e) => document.querySelectorAll('tbody tr[data-busca]').forEach((tr) =>
      tr.classList.toggle('hidden', !tr.dataset.busca.includes(e.target.value.toLowerCase())));
    acoes(lista, form, async (a) => {
      if (!confirm(`Excluir ${a.nome}? As matrículas dele também serão removidas.`)) return;
      await api('DELETE', `/api/alunos/${a.id}`); toast('Aluno excluído'); telas.alunos();
    });
  },

  async planos() {
    const lista = await api('GET', '/api/planos');
    const campos = [
      { nome: 'nome', rotulo: 'Nome do plano', obrig: true },
      { nome: 'preco', rotulo: 'Preço mensal (R$)', tipo: 'number', obrig: true },
      { nome: 'duracao_meses', rotulo: 'Duração (meses)', tipo: 'number', obrig: true, padrao: 1 },
      { nome: 'descricao', rotulo: 'Descrição' }
    ];
    const form = (p) => abrirModal(p ? 'Editar plano' : 'Novo plano', campos, p, async (v) => {
      await api(p ? 'PUT' : 'POST', p ? `/api/planos/${p.id}` : '/api/planos', v);
      toast(p ? 'Plano atualizado' : 'Plano criado'); telas.planos();
    });
    botaoNovo(() => form());
    $('#view').innerHTML = `<div class="cards">${lista.map((p) => `<div class="card">
        <div class="rotulo">${p.duracao_meses} ${p.duracao_meses > 1 ? 'meses' : 'mês'}</div>
        <div class="valor">${esc(p.nome)}</div><p style="font-size:20px;margin:6px 0;color:var(--verde)">${brl(p.preco)}<span class="muted">/mês</span></p>
        <p class="muted">${esc(p.descricao)}</p><br>
        <button class="btn sm" data-ed="${p.id}">Editar</button> <button class="btn sm danger" data-del="${p.id}">Excluir</button></div>`).join('')
        || '<p class="vazio">Nenhum plano</p>'}</div>`;
    acoes(lista, form, async (p) => {
      if (!confirm(`Excluir o plano ${p.nome}?`)) return;
      try { await api('DELETE', `/api/planos/${p.id}`); toast('Plano excluído'); telas.planos(); } catch (e) { toast(e.message); }
    });
  },

  async matriculas() {
    const [lista, alunos, planos] = await Promise.all([api('GET', '/api/matriculas'), api('GET', '/api/alunos'), api('GET', '/api/planos')]);
    botaoNovo(() => abrirModal('Nova matrícula', [
      { nome: 'aluno_id', rotulo: 'Aluno', obrig: true, opcoes: alunos.map((a) => ({ v: a.id, t: a.nome })) },
      { nome: 'plano_id', rotulo: 'Plano', obrig: true, opcoes: planos.map((p) => ({ v: p.id, t: `${p.nome} — ${brl(p.preco)}/mês` })) },
      { nome: 'inicio', rotulo: 'Data de início', tipo: 'date', padrao: hoje(), obrig: true }
    ], null, async (v) => { await api('POST', '/api/matriculas', v); toast('Matrícula realizada'); telas.matriculas(); }));
    const situacao = (m) => (m.status === 'cancelada' ? 'cancelada' : m.fim < hoje() ? 'vencida' : 'ativa');
    $('#view').innerHTML = `<table class="tabela"><thead><tr><th>Aluno</th><th>Plano</th><th>Início</th><th>Vence em</th><th>Valor</th><th>Situação</th><th></th></tr></thead>
      <tbody>${lista.map((m) => `<tr><td>${esc(m.aluno)}</td><td>${esc(m.plano)}</td><td>${dataBR(m.inicio)}</td><td>${dataBR(m.fim)}</td><td>${brl(m.valor)}</td>
        <td><span class="badge ${situacao(m)}">${situacao(m)}</span></td>
        <td class="acoes"><button class="btn sm" data-ren="${m.id}">Renovar</button>
        ${m.status === 'ativa' ? `<button class="btn sm danger" data-can="${m.id}">Cancelar</button>` : ''}</td></tr>`).join('')
        || '<tr><td colspan="7" class="vazio">Nenhuma matrícula</td></tr>'}</tbody></table>`;
    document.querySelectorAll('[data-ren]').forEach((b) => b.onclick = async () => {
      await api('PUT', `/api/matriculas/${b.dataset.ren}/renovar`); toast('Matrícula renovada'); telas.matriculas();
    });
    document.querySelectorAll('[data-can]').forEach((b) => b.onclick = async () => {
      if (!confirm('Cancelar esta matrícula?')) return;
      await api('PUT', `/api/matriculas/${b.dataset.can}/cancelar`); toast('Matrícula cancelada'); telas.matriculas();
    });
  }
};

function botaoNovo(fn) { const b = $('#btn-novo'); b.classList.remove('hidden'); b.onclick = fn; }
function acoes(lista, editar, excluir) {
  document.querySelectorAll('[data-ed]').forEach((b) => b.onclick = () => editar(lista.find((x) => x.id == b.dataset.ed)));
  document.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => excluir(lista.find((x) => x.id == b.dataset.del)));
}

const TITULOS = { painel: 'Visão geral', alunos: 'Alunos', planos: 'Planos', matriculas: 'Matrículas' };
function rotear() {
  const v = (location.hash.slice(1) || 'painel');
  const tela = telas[v] ? v : 'painel';
  $('#titulo').textContent = TITULOS[tela];
  $('#btn-novo').classList.add('hidden');
  document.querySelectorAll('.sidebar nav a').forEach((a) => a.classList.toggle('ativo', a.dataset.view === tela));
  telas[tela]().catch(() => {});
}
window.addEventListener('hashchange', () => { if (!$('#app').classList.contains('hidden')) rotear(); });

// Ao abrir: verifica se já está logado
api('GET', '/api/me').then(mostrarApp).catch(mostrarLogin);
