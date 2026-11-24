// FitGo — frontend (SPA em JavaScript puro). Consome a API REST do backend.

// ---------------- Ícones (SVG no estilo "Lucide") ----------------
const ICONES = {
  logo: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 9M22 21a7 7 0 0 0-4-6.3"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
};
const icone = (nome, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${ICONES[nome] || ''}</svg>`;
const pintarIcones = (raiz = document) => raiz.querySelectorAll('[data-icon]').forEach((el) => { el.outerHTML = icone(el.dataset.icon); });

// ---------------- Utilitários ----------------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (d) => (d ? `${d.slice(8, 10)} ${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : '—');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hojeISO = () => new Date().toISOString().slice(0, 10);
const diasAte = (d) => Math.ceil((new Date(d + 'T00:00:00') - new Date(hojeISO() + 'T00:00:00')) / 864e5);
const CORES = ['#a3e635', '#60a5fa', '#a78bfa', '#fbbf24', '#f472b6', '#34d399', '#fb923c', '#22d3ee'];
const corDe = (txt) => CORES[[...String(txt)].reduce((s, c) => s + c.charCodeAt(0), 0) % CORES.length];
const iniciais = (nome) => String(nome).split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const avatar = (nome, cls = '') => `<span class="avatar ${cls}" style="background:${corDe(nome)}">${esc(iniciais(nome))}</span>`;

async function api(metodo, rota, corpo) {
  const r = await fetch(rota, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: corpo ? JSON.stringify(corpo) : undefined });
  const dados = await r.json().catch(() => ({}));
  if (r.status === 401 && rota !== '/api/login') { mostrarLogin(); throw new Error(dados.erro || 'Sessão expirada'); }
  if (!r.ok) throw new Error(dados.erro || 'Algo deu errado');
  return dados;
}

// ---------------- Feedback: toast, confirmação, contadores ----------------
function toast(msg, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = `toast ${tipo}`;
  t.innerHTML = `<span class="t-ico">${icone(tipo === 'ok' ? 'check' : 'alert')}</span><span>${esc(msg)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => { t.classList.add('sai'); setTimeout(() => t.remove(), 200); }, 2600);
}

function confirmar(titulo, texto, rotulo = 'Confirmar') {
  return new Promise((ok) => {
    const d = $('#confirmar');
    $('#conf-titulo').textContent = titulo; $('#conf-texto').textContent = texto; $('#conf-sim').textContent = rotulo;
    const fim = (v) => { d.close(); ok(v); };
    $('#conf-sim').onclick = () => fim(true);
    $('#conf-nao').onclick = () => fim(false);
    d.oncancel = () => ok(false);
    d.showModal();
  });
}

function contar(el, alvo, formatar = (v) => Math.round(v)) {
  const t0 = performance.now(), dur = 900;
  const passo = (t) => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = formatar(alvo * e);
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

const skeleton = (linhas = 6) => `<div style="display:grid;gap:12px">${'<div class="sk" style="height:52px"></div>'.repeat(linhas)}</div>`;
const vazio = (txt, ic = 'search') => `<div class="empty">${icone(ic)}<div>${esc(txt)}</div></div>`;

// ---------------- Máscaras ----------------
const mascaras = {
  cpf: (v) => v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
  tel: (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
};

// ---------------- Login ----------------
function mostrarLogin() {
  $('#app').classList.add('hidden'); $('#tela-login').classList.remove('hidden');
  setTimeout(() => $('#form-login [name=usuario]').focus(), 300);
}
const PERFIS = { admin: 'Administrador', recepcao: 'Recepção' };
let PERFIL = 'admin';
function mostrarApp(u) {
  $('#tela-login').classList.add('hidden'); $('#app').classList.remove('hidden');
  PERFIL = u.perfil || 'admin';
  document.body.classList.toggle('perfil-recepcao', PERFIL !== 'admin');
  $('#nome-usuario').textContent = u.nome;
  $('#perfil-usuario').textContent = PERFIS[PERFIL] || PERFIL;
  const av = $('#avatar-user'); av.textContent = iniciais(u.nome); av.style.background = corDe(u.nome);
  $('#hoje').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  rotear();
}
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target), btn = $('#btn-entrar');
  btn.disabled = true; btn.style.opacity = .7;
  try {
    const u = await api('POST', '/api/login', { usuario: f.get('usuario'), senha: f.get('senha') });
    $('#erro-login').textContent = ''; mostrarApp(u);
  } catch (err) {
    $('#erro-login').textContent = err.message;
    $('#form-login').animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 280 });
  } finally { btn.disabled = false; btn.style.opacity = 1; }
});
$('#sair').addEventListener('click', async () => {
  if (!(await confirmar('Sair do painel?', 'Você precisará entrar novamente para acessar.', 'Sair'))) return;
  await api('POST', '/api/logout'); mostrarLogin();
});
$('#menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

// ---------------- Modal de formulário ----------------
function abrirModal({ titulo, sub = '', campos, valores = {}, botao = 'Salvar', aoSalvar }) {
  $('#modal-titulo').textContent = titulo; $('#modal-sub').textContent = sub;
  $('#erro-modal').textContent = ''; $('#salvar').textContent = botao;
  const campo = (c) => {
    const v = valores[c.nome] ?? c.padrao ?? '';
    const ctrl = c.opcoes
      ? `<select class="input" name="${c.nome}" ${c.obrig ? 'required' : ''}>${c.opcoes.map((o) => `<option value="${o.v}" ${String(o.v) === String(v) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}</select>`
      : `<input class="input" name="${c.nome}" type="${c.tipo || 'text'}" ${c.tipo === 'number' ? 'step="0.01" min="0"' : ''} ${c.mascara ? `data-mask="${c.mascara}"` : ''} value="${esc(v)}" placeholder="${esc(c.ph || '')}" ${c.obrig ? 'required' : ''}>`;
    return `<label class="field"><span>${c.rotulo}${c.obrig ? ' *' : ''}</span>${ctrl}</label>`;
  };
  const html = [];
  for (let i = 0; i < campos.length; i++) {
    if (campos[i].meia && campos[i + 1]?.meia) { html.push(`<div class="two">${campo(campos[i])}${campo(campos[i + 1])}</div>`); i++; }
    else html.push(campo(campos[i]));
  }
  $('#modal-campos').innerHTML = html.join('');
  $$('[data-mask]', $('#modal-campos')).forEach((inp) => { inp.addEventListener('input', () => { inp.value = mascaras[inp.dataset.mask](inp.value); }); });
  const modal = $('#modal'), form = $('#form-modal');
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const btn = $('#salvar'); btn.disabled = true;
    try { await aoSalvar(Object.fromEntries(new FormData(form))); modal.close(); }
    catch (err) { $('#erro-modal').textContent = err.message; }
    finally { btn.disabled = false; }
  };
  $$('[data-fechar]', modal).forEach((b) => { b.onclick = () => modal.close(); });
  modal.showModal();
  setTimeout(() => $('input, select', modal)?.focus(), 60);
}

// ---------------- Exportar CSV (abre no Excel) ----------------
function exportarCSV(nomeArquivo, colunas, linhas) {
  const cel = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [colunas.map((c) => cel(c.titulo)).join(';'), ...linhas.map((l) => colunas.map((c) => cel(c.valor(l))).join(';'))].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `${nomeArquivo}-${hojeISO()}.csv`;
  a.click(); URL.revokeObjectURL(a.href);
  toast(`${linhas.length} registro(s) exportado(s)`);
}

// ---------------- Ficha do aluno (painel lateral) ----------------
async function abrirFicha(id) {
  const d = $('#drawer'), body = $('#drawer-body');
  body.innerHTML = skeleton(4);
  d.showModal();
  try {
    const a = await api('GET', `/api/alunos/${id}`);
    const ativa = a.matriculas.find((m) => situacao(m) === 'ativa');
    const idade = a.nascimento ? Math.floor((Date.now() - new Date(a.nascimento + 'T00:00:00')) / 3.15576e10) : null;
    const gasto = a.matriculas.reduce((s, m) => s + m.valor, 0);
    body.innerHTML = `<div class="anim" style="display:grid;gap:18px">
      <div class="drawer-id">${avatar(a.nome, 'lg')}<div><h3>${esc(a.nome)}</h3>
        <div class="tiny">Aluno desde ${dataBR(a.criado_em)}</div>
        <div style="margin-top:6px">${ativa ? `<span class="badge ativa">${esc(ativa.plano)} · vence em ${dataBR(ativa.fim)}</span>` : '<span class="badge neutro">Sem plano ativo</span>'}</div></div></div>
      <div class="info-grid">
        <div class="info"><div class="tiny">CPF</div><div class="num">${esc(a.cpf)}</div></div>
        <div class="info"><div class="tiny">Idade</div><div>${idade !== null ? idade + ' anos' : '—'}</div></div>
        <div class="info"><div class="tiny">${icone('phone')}</div><div class="num">${esc(a.telefone || '—')}</div></div>
        <div class="info"><div class="tiny">${icone('mail')}</div><div style="overflow:hidden;text-overflow:ellipsis">${esc(a.email || '—')}</div></div>
      </div>
      <div class="info-grid">
        <div class="info"><div class="tiny">Matrículas</div><div style="font-size:20px;font-weight:650">${a.matriculas.length}</div></div>
        <div class="info"><div class="tiny">Valor em planos</div><div style="font-size:20px;font-weight:650">${brl(gasto)}</div></div>
      </div>
      <div><div class="panel-head" style="margin-bottom:12px"><h3>Histórico</h3><button class="btn sm primary" id="ficha-matricular">${icone('plus')} Matricular</button></div>
        <div class="timeline">${a.matriculas.map((m) => { const s = situacao(m); return `<div class="tl-item"><span class="tl-dot ${s}"></span>
          <div><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-weight:600">${esc(m.plano)}</b><span class="badge ${s}">${SIT_TXT[s]}</span></div>
          <div class="tiny">${dataBR(m.inicio)} → ${dataBR(m.fim)} · ${brl(m.valor)}/mês</div></div></div>`; }).join('') || vazio('Nenhuma matrícula ainda', 'clipboard')}</div></div>
    </div>`;
    $('#ficha-matricular').onclick = () => { d.close(); location.hash = 'matriculas'; setTimeout(() => $('#novo')?.click(), 450); sessionStorage.setItem('fitgo-aluno', a.id); };
  } catch (e) { body.innerHTML = vazio(e.message, 'alert'); }
}
$('#drawer-fechar').addEventListener('click', () => $('#drawer').close());
$('#drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') e.target.close(); });

// ---------------- Gráficos (SVG puro) ----------------
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function graficoBarras(dados) {
  const max = Math.max(1, ...dados.map((d) => d.total));
  return `<div class="bars">${dados.map((d, i) => `
    <div class="bar-col" title="${d.total} matrícula(s) · ${brl(d.valor)}">
      <div class="bar-wrap"><div class="bar ${d.total ? '' : 'zero'}" style="height:${Math.max(3, (d.total / max) * 100)}%;animation-delay:${i * 70}ms">
        <span class="bar-tip">${d.total}</span></div></div>
      <span class="bar-label">${MESES[Number(d.mes.slice(5)) - 1]}</span>
    </div>`).join('')}</div>`;
}
function graficoRosca(dados) {
  const total = dados.reduce((s, d) => s + d.total, 0);
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  const arcos = dados.map((d, i) => {
    const frac = total ? d.total / total : 0, len = frac * C;
    const arco = `<circle cx="75" cy="75" r="${R}" fill="none" stroke="${CORES[i % CORES.length]}" stroke-width="16"
      stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}" transform="rotate(-90 75 75)" stroke-linecap="butt"/>`;
    acc += len; return arco;
  }).join('');
  return `<div class="donut-wrap">
    <svg class="donut" viewBox="0 0 150 150"><circle cx="75" cy="75" r="${R}" fill="none" stroke="#1e1e25" stroke-width="16"/>${arcos}
      <text x="75" y="76" text-anchor="middle" class="donut-center">${total}</text>
      <text x="75" y="94" text-anchor="middle" class="donut-sub">ativas</text></svg>
    <div class="legend">${dados.map((d, i) => `<div><i style="background:${CORES[i % CORES.length]}"></i>${esc(d.plano)}<b>${total ? Math.round(d.total / total * 100) : 0}%</b></div>`).join('')}</div>
  </div>`;
}

// ---------------- Telas ----------------
const situacao = (m) => (m.status === 'cancelada' ? 'cancelada' : m.fim < hojeISO() ? 'vencida' : 'ativa');
const SIT_TXT = { ativa: 'Ativa', vencida: 'Vencida', cancelada: 'Cancelada' };

function cabecalho(titulo, sub, acoes = '') {
  return `<div class="page-head"><div><h1>${titulo}</h1><p>${sub}</p></div><div class="head-actions">${acoes}</div></div>`;
}

const telas = {
  async painel(v) {
    v.innerHTML = skeleton(4);
    const d = await api('GET', '/api/dashboard');
    const hora = new Date().getHours();
    const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    v.innerHTML = `<div class="anim">
      <section class="hero">
        <img onerror="this.remove()" src="https://images.unsplash.com/photo-1637430308606-86576d8fef3c?auto=format&fit=crop&w=1800&q=80" alt="Fileira de aparelhos de musculação">
        <div class="hero-body">
          <span class="pill">${icone('spark')} ${saud}, ${esc($('#nome-usuario').textContent.split(' ')[0])}</span>
          <h2>Treino em dia,<br>gestão em ordem.</h2>
          <p>${d.vencendo.length ? `${d.vencendo.length} matrícula(s) vencem nos próximos 7 dias.` : 'Nenhuma matrícula vencendo nesta semana.'}</p>
          <div class="head-actions"><a class="btn primary" href="#matriculas">${icone('plus')} Nova matrícula</a><a class="btn" href="#alunos">Ver alunos</a></div>
        </div>
        <span class="credito">Foto: Mohamed Fareed / Unsplash</span>
      </section>

      <section class="kpis">
        <div class="kpi"><div class="kpi-top">Alunos cadastrados<span class="kpi-ico c-blue">${icone('users')}</span></div><div class="kpi-val" data-n="${d.alunos}">0</div><div class="kpi-sub">base total de alunos</div></div>
        <div class="kpi"><div class="kpi-top">Matrículas ativas<span class="kpi-ico c-lime">${icone('trend')}</span></div><div class="kpi-val" data-n="${d.ativas}">0</div><div class="kpi-sub">${d.alunos ? Math.round(d.ativas / d.alunos * 100) : 0}% dos alunos com plano ativo</div></div>
        <div class="kpi"><div class="kpi-top">Receita mensal<span class="kpi-ico c-violet">${icone('wallet')}</span></div><div class="kpi-val" data-n="${d.receita}" data-brl>R$ 0</div><div class="kpi-sub">soma das mensalidades ativas</div></div>
        <div class="kpi"><div class="kpi-top">Vencendo em 7 dias<span class="kpi-ico c-amber">${icone('clock')}</span></div><div class="kpi-val" data-n="${d.vencendo.length}">0</div><div class="kpi-sub">renovações a acompanhar</div></div>
      </section>

      <section class="grid-2">
        <div class="panel"><div class="panel-head"><div><h3>Novas matrículas</h3><div class="tiny">Últimos 6 meses</div></div><span class="badge neutro">${d.porMes.reduce((s, m) => s + m.total, 0)} no período</span></div>${graficoBarras(d.porMes)}</div>
        <div class="panel"><div class="panel-head"><div><h3>Distribuição por plano</h3><div class="tiny">Matrículas ativas</div></div></div>${graficoRosca(d.porPlano)}</div>
      </section>

      <section class="grid-2">
        <div class="panel"><div class="panel-head"><h3>Matrículas recentes</h3><a class="btn sm ghost" href="#matriculas">Ver todas ${icone('arrow')}</a></div>
          <div class="list">${d.recentes.map((m) => `<div class="row-item">${avatar(m.aluno)}<div class="meta"><div class="nome">${esc(m.aluno)}</div><div class="tiny">${esc(m.plano)} · desde ${dataBR(m.inicio)}</div></div><div class="right"><div class="num">${brl(m.valor)}</div></div></div>`).join('') || vazio('Nenhuma matrícula ainda', 'clipboard')}</div></div>
        <div class="panel"><div class="panel-head"><h3>Vencendo esta semana</h3>${icone('calendar')}</div>
          <div class="list">${d.vencendo.map((m) => `<div class="row-item">${avatar(m.aluno)}<div class="meta"><div class="nome">${esc(m.aluno)}</div><div class="tiny">${esc(m.plano)}</div></div><div class="right"><span class="badge vencida">${diasAte(m.fim) <= 0 ? 'hoje' : `em ${diasAte(m.fim)} dia(s)`}</span></div></div>`).join('') || vazio('Tudo em dia por aqui', 'check')}</div></div>
      </section></div>`;
    $$('.kpi-val', v).forEach((el) => contar(el, Number(el.dataset.n), el.hasAttribute('data-brl') ? brl : (x) => Math.round(x)));
  },

  async alunos(v) {
    v.innerHTML = cabecalho('Alunos', 'Cadastre e gerencie os alunos da academia.') + skeleton();
    const lista = await api('GET', '/api/alunos');
    const campos = [
      { nome: 'nome', rotulo: 'Nome completo', obrig: true, ph: 'Ex.: Maria Oliveira' },
      { nome: 'cpf', rotulo: 'CPF', obrig: true, ph: '000.000.000-00', mascara: 'cpf', meia: true },
      { nome: 'nascimento', rotulo: 'Nascimento', tipo: 'date', meia: true },
      { nome: 'telefone', rotulo: 'Telefone', ph: '(85) 90000-0000', mascara: 'tel', meia: true },
      { nome: 'email', rotulo: 'E-mail', tipo: 'email', ph: 'nome@email.com', meia: true }
    ];
    const form = (a) => abrirModal({
      titulo: a ? 'Editar aluno' : 'Novo aluno', sub: a ? a.nome : 'Preencha os dados do aluno.', campos, valores: a || {},
      botao: a ? 'Salvar alterações' : 'Cadastrar aluno',
      aoSalvar: async (val) => { await api(a ? 'PUT' : 'POST', a ? `/api/alunos/${a.id}` : '/api/alunos', val); toast(a ? 'Aluno atualizado' : 'Aluno cadastrado'); telas.alunos(v); }
    });
    let filtro = 'todos', busca = '';
    const ativos = lista.filter((a) => a.plano_atual).length;
    v.innerHTML = `<div class="anim">${cabecalho('Alunos', `${lista.length} aluno(s) cadastrado(s) · ${ativos} com plano ativo`, `<button class="btn" id="exportar">${icone('download')} Exportar</button><button class="btn primary" id="novo">${icone('plus')} Novo aluno</button>`)}
      <div class="toolbar">
        <div class="input-icon">${icone('search')}<input class="input" id="busca" placeholder="Buscar por nome, CPF ou e-mail…"></div>
        <div class="chips" id="chips"><button class="chip on" data-f="todos">Todos <small>${lista.length}</small></button><button class="chip" data-f="ativos">Com plano <small>${ativos}</small></button><button class="chip" data-f="sem">Sem plano <small>${lista.length - ativos}</small></button></div>
      </div>
      <div class="table-card"><table><thead><tr><th>Aluno</th><th class="hide-sm">CPF</th><th class="hide-sm">Telefone</th><th>Plano</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
    const desenhar = () => {
      const q = busca.toLowerCase();
      const rows = lista.filter((a) => (filtro === 'todos' || (filtro === 'ativos' ? a.plano_atual : !a.plano_atual))
        && (a.nome + a.cpf + a.email).toLowerCase().includes(q));
      $('#tb').innerHTML = rows.map((a, i) => `<tr style="animation-delay:${i * 25}ms">
        <td><div class="cell-user link-nome" data-ver="${a.id}" title="Ver ficha">${avatar(a.nome)}<div><div class="nome">${esc(a.nome)}</div><div class="tiny">${esc(a.email || '—')}</div></div></div></td>
        <td class="hide-sm num muted">${esc(a.cpf)}</td><td class="hide-sm num muted">${esc(a.telefone || '—')}</td>
        <td>${a.plano_atual ? `<span class="badge ativa">${esc(a.plano_atual)}</span>` : '<span class="badge neutro">Sem plano</span>'}</td>
        <td class="acoes"><button class="icon-btn" title="Ver ficha" data-ver="${a.id}">${icone('eye')}</button><button class="icon-btn" title="Editar" data-ed="${a.id}">${icone('edit')}</button><button class="icon-btn del so-admin" title="Excluir" data-del="${a.id}">${icone('trash')}</button></td></tr>`).join('')
        || `<tr><td colspan="5">${vazio('Nenhum aluno encontrado')}</td></tr>`;
      $$('[data-ver]', v).forEach((b) => { b.onclick = () => abrirFicha(b.dataset.ver); });
      $$('[data-ed]', v).forEach((b) => { b.onclick = () => form(lista.find((x) => x.id == b.dataset.ed)); });
      $$('[data-del]', v).forEach((b) => { b.onclick = async () => {
        const a = lista.find((x) => x.id == b.dataset.del);
        if (!(await confirmar(`Excluir ${a.nome}?`, 'O aluno e todas as matrículas dele serão removidos. Essa ação não pode ser desfeita.', 'Excluir aluno'))) return;
        await api('DELETE', `/api/alunos/${a.id}`); toast('Aluno excluído'); telas.alunos(v); atualizarContadores();
      }; });
    };
    $('#novo').onclick = () => form();
    $('#exportar').onclick = () => exportarCSV('fitgo-alunos', [
      { titulo: 'Nome', valor: (a) => a.nome }, { titulo: 'CPF', valor: (a) => a.cpf }, { titulo: 'Telefone', valor: (a) => a.telefone },
      { titulo: 'E-mail', valor: (a) => a.email }, { titulo: 'Nascimento', valor: (a) => a.nascimento }, { titulo: 'Plano atual', valor: (a) => a.plano_atual || 'Sem plano' }
    ], lista);
    $('#busca').oninput = (e) => { busca = e.target.value; desenhar(); };
    $$('.chip', v).forEach((c) => { c.onclick = () => { $$('.chip', v).forEach((x) => x.classList.remove('on')); c.classList.add('on'); filtro = c.dataset.f; desenhar(); }; });
    desenhar();
  },

  async planos(v) {
    v.innerHTML = cabecalho('Planos', 'Monte os planos oferecidos pela academia.') + skeleton(3);
    const lista = await api('GET', '/api/planos');
    const campos = [
      { nome: 'nome', rotulo: 'Nome do plano', obrig: true, ph: 'Ex.: Semestral' },
      { nome: 'preco', rotulo: 'Preço mensal (R$)', tipo: 'number', obrig: true, meia: true },
      { nome: 'duracao_meses', rotulo: 'Duração (meses)', tipo: 'number', obrig: true, padrao: 1, meia: true },
      { nome: 'descricao', rotulo: 'O que inclui', ph: 'Ex.: Musculação + aulas coletivas' }
    ];
    const form = (p) => abrirModal({
      titulo: p ? 'Editar plano' : 'Novo plano', sub: p ? p.nome : 'Defina preço e duração.', campos, valores: p || {},
      botao: p ? 'Salvar alterações' : 'Criar plano',
      aoSalvar: async (val) => { await api(p ? 'PUT' : 'POST', p ? `/api/planos/${p.id}` : '/api/planos', val); toast(p ? 'Plano atualizado' : 'Plano criado'); telas.planos(v); }
    });
    const topo = lista.reduce((a, b) => (b.ativos > (a?.ativos ?? -1) ? b : a), null);
    v.innerHTML = `<div class="anim">${cabecalho('Planos', `${lista.length} plano(s) disponível(is)`, `<button class="btn primary so-admin" id="novo">${icone('plus')} Novo plano</button>`)}
      <div class="plans anim">${lista.map((p) => `<article class="plan ${topo && p.id === topo.id && p.ativos ? 'top' : ''}">
        ${topo && p.id === topo.id && p.ativos ? `<span class="badge ativa tag">Mais popular</span>` : ''}
        <div><h3>${esc(p.nome)}</h3><div class="tiny">${p.duracao_meses} ${p.duracao_meses > 1 ? 'meses' : 'mês'} de duração</div></div>
        <div class="price">${brl(p.preco)}<small> /mês</small></div>
        <ul>${(p.descricao || 'Acesso à academia').split(/\s*\+\s*|,\s*/).map((x) => `<li>${icone('check')}${esc(x)}</li>`).join('')}</ul>
        <div class="plan-foot"><span class="tiny">${icone('users', '')} ${p.ativos} aluno(s) ativo(s)</span>
          <span class="so-admin"><button class="icon-btn" title="Editar" data-ed="${p.id}">${icone('edit')}</button><button class="icon-btn del" title="Excluir" data-del="${p.id}">${icone('trash')}</button></span></div>
      </article>`).join('') || vazio('Nenhum plano cadastrado', 'tag')}</div></div>`;
    $('#novo').onclick = () => form();
    $$('[data-ed]', v).forEach((b) => { b.onclick = () => form(lista.find((x) => x.id == b.dataset.ed)); });
    $$('[data-del]', v).forEach((b) => { b.onclick = async () => {
      const p = lista.find((x) => x.id == b.dataset.del);
      if (!(await confirmar(`Excluir o plano ${p.nome}?`, 'Planos com matrículas não podem ser excluídos.', 'Excluir plano'))) return;
      try { await api('DELETE', `/api/planos/${p.id}`); toast('Plano excluído'); telas.planos(v); atualizarContadores(); } catch (e) { toast(e.message, 'err'); }
    }; });
  },

  async matriculas(v) {
    v.innerHTML = cabecalho('Matrículas', 'Matricule, renove e acompanhe os vencimentos.') + skeleton();
    const [lista, alunos, planos] = await Promise.all([api('GET', '/api/matriculas'), api('GET', '/api/alunos'), api('GET', '/api/planos')]);
    const cont = { todas: lista.length, ativa: 0, vencida: 0, cancelada: 0 };
    lista.forEach((m) => { cont[situacao(m)]++; });
    let filtro = 'todas', busca = '';
    v.innerHTML = `<div class="anim">${cabecalho('Matrículas', `${cont.ativa} ativa(s) · ${cont.vencida} vencida(s)`, `<button class="btn" id="exportar">${icone('download')} Exportar</button><button class="btn primary" id="novo">${icone('plus')} Nova matrícula</button>`)}
      <div class="toolbar">
        <div class="input-icon">${icone('search')}<input class="input" id="busca" placeholder="Buscar aluno ou plano…"></div>
        <div class="chips">${['todas', 'ativa', 'vencida', 'cancelada'].map((f) => `<button class="chip ${f === 'todas' ? 'on' : ''}" data-f="${f}">${f === 'todas' ? 'Todas' : SIT_TXT[f] + 's'} <small>${cont[f]}</small></button>`).join('')}</div>
      </div>
      <div class="table-card"><table><thead><tr><th>Aluno</th><th>Plano</th><th class="hide-sm">Período</th><th class="hide-sm">Restante</th><th>Situação</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
    const desenhar = () => {
      const q = busca.toLowerCase();
      const rows = lista.filter((m) => (filtro === 'todas' || situacao(m) === filtro) && (m.aluno + m.plano).toLowerCase().includes(q));
      $('#tb').innerHTML = rows.map((m, i) => {
        const s = situacao(m), total = Math.max(1, diasAte(m.fim) - diasAte(m.inicio)), rest = Math.max(0, diasAte(m.fim));
        const pct = s === 'ativa' ? Math.min(100, Math.round(rest / total * 100)) : 0;
        return `<tr style="animation-delay:${i * 25}ms">
          <td><div class="cell-user link-nome" data-ver="${m.aluno_id}" title="Ver ficha">${avatar(m.aluno)}<div class="nome">${esc(m.aluno)}</div></div></td>
          <td><div>${esc(m.plano)}</div><div class="tiny num">${brl(m.valor)}/mês</div></td>
          <td class="hide-sm tiny">${dataBR(m.inicio)} → ${dataBR(m.fim)}</td>
          <td class="hide-sm"><div class="progress ${s !== 'ativa' ? 'off' : rest <= 7 ? 'warn' : ''}"><span style="width:${s === 'ativa' ? Math.max(4, pct) : 100}%"></span></div><div class="tiny" style="margin-top:4px">${s === 'ativa' ? `${rest} dia(s)` : '—'}</div></td>
          <td><span class="badge ${s}">${SIT_TXT[s]}</span></td>
          <td class="acoes"><button class="icon-btn" title="Renovar" data-ren="${m.id}">${icone('refresh')}</button>${m.status === 'ativa' ? `<button class="icon-btn del so-admin" title="Cancelar" data-can="${m.id}">${icone('ban')}</button>` : ''}</td></tr>`;
      }).join('') || `<tr><td colspan="6">${vazio('Nenhuma matrícula encontrada', 'clipboard')}</td></tr>`;
      $$('[data-ver]', v).forEach((b) => { b.onclick = () => abrirFicha(b.dataset.ver); });
      $$('[data-ren]', v).forEach((b) => { b.onclick = async () => {
        const m = lista.find((x) => x.id == b.dataset.ren);
        if (!(await confirmar(`Renovar matrícula de ${m.aluno}?`, `O plano ${m.plano} será estendido por mais um período.`, 'Renovar'))) return;
        await api('PUT', `/api/matriculas/${m.id}/renovar`); toast('Matrícula renovada'); telas.matriculas(v);
      }; });
      $$('[data-can]', v).forEach((b) => { b.onclick = async () => {
        const m = lista.find((x) => x.id == b.dataset.can);
        if (!(await confirmar(`Cancelar matrícula de ${m.aluno}?`, 'A matrícula deixa de contar como ativa. Você pode renová-la depois.', 'Cancelar matrícula'))) return;
        await api('PUT', `/api/matriculas/${m.id}/cancelar`); toast('Matrícula cancelada'); telas.matriculas(v);
      }; });
    };
    $('#novo').onclick = () => abrirModal({
      titulo: 'Nova matrícula', sub: 'O vencimento e o valor são calculados pelo plano.', botao: 'Matricular',
      campos: [
        { nome: 'aluno_id', rotulo: 'Aluno', obrig: true, padrao: sessionStorage.getItem('fitgo-aluno') || '', opcoes: alunos.map((a) => ({ v: a.id, t: a.nome })) },
        { nome: 'plano_id', rotulo: 'Plano', obrig: true, opcoes: planos.map((p) => ({ v: p.id, t: `${p.nome} — ${brl(p.preco)}/mês · ${p.duracao_meses} ${p.duracao_meses > 1 ? 'meses' : 'mês'}` })) },
        { nome: 'inicio', rotulo: 'Data de início', tipo: 'date', padrao: hojeISO(), obrig: true }
      ],
      aoSalvar: async (val) => { await api('POST', '/api/matriculas', val); toast('Matrícula realizada'); telas.matriculas(v); atualizarContadores(); }
    });
    { const original = $('#novo').onclick; $('#novo').onclick = () => { original(); sessionStorage.removeItem('fitgo-aluno'); }; }
    $('#exportar').onclick = () => exportarCSV('fitgo-matriculas', [
      { titulo: 'Aluno', valor: (m) => m.aluno }, { titulo: 'Plano', valor: (m) => m.plano }, { titulo: 'Início', valor: (m) => m.inicio },
      { titulo: 'Vencimento', valor: (m) => m.fim }, { titulo: 'Valor mensal', valor: (m) => String(m.valor).replace('.', ',') }, { titulo: 'Situação', valor: (m) => SIT_TXT[situacao(m)] }
    ], lista);
    $('#busca').oninput = (e) => { busca = e.target.value; desenhar(); };
    $$('.chip', v).forEach((c) => { c.onclick = () => { $$('.chip', v).forEach((x) => x.classList.remove('on')); c.classList.add('on'); filtro = c.dataset.f; desenhar(); }; });
    desenhar();
  }
};

// ---------------- Navegação ----------------
telas.equipe = async (v) => {
  if (PERFIL !== 'admin') { v.innerHTML = vazio('Somente administradores acessam a equipe', 'shield'); return; }
  v.innerHTML = skeleton(3);
  const lista = await api('GET', '/api/usuarios');
  v.innerHTML = `<div class="anim">${cabecalho('Equipe', `${lista.length} usuário(s) com acesso ao sistema`, `<button class="btn primary" id="novo">${icone('plus')} Novo usuário</button>`)}
    <div class="panel" style="margin-bottom:16px"><div class="tiny" style="display:flex;gap:10px;align-items:center">${icone('shield')}
      <span><b style="color:var(--txt)">Administrador</b> faz tudo. <b style="color:var(--txt)">Recepção</b> cadastra e edita alunos, matricula e renova — mas não exclui alunos, não cancela matrículas e não altera planos.</span></div></div>
    <div class="panel tabela-wrap"><table class="tabela"><thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th></th></tr></thead><tbody>
    ${lista.map((u) => `<tr><td><div class="cell-user">${avatar(u.nome)}<div class="nome">${esc(u.nome)}</div></div></td>
      <td class="num">${esc(u.usuario)}</td><td><span class="badge ${u.perfil === 'admin' ? 'ativa' : 'neutro'}">${PERFIS[u.perfil] || u.perfil}</span></td>
      <td class="acoes"><button class="icon-btn del" title="Excluir" data-del="${u.id}">${icone('trash')}</button></td></tr>`).join('')}
    </tbody></table></div></div>`;
  $('#novo').onclick = () => abrirModal({
    titulo: 'Novo usuário', sub: 'Dê acesso a um funcionário da academia', botao: 'Criar usuário',
    campos: [
      { nome: 'nome', rotulo: 'Nome', obrig: true },
      { nome: 'usuario', rotulo: 'Usuário de acesso', obrig: true, meia: true },
      { nome: 'senha', rotulo: 'Senha (mín. 6)', tipo: 'password', obrig: true, meia: true },
      { nome: 'perfil', rotulo: 'Perfil', obrig: true, opcoes: [{ v: 'recepcao', t: 'Recepção' }, { v: 'admin', t: 'Administrador' }] }
    ],
    aoSalvar: async (val) => { await api('POST', '/api/usuarios', val); toast('Usuário criado'); telas.equipe(v); }
  });
  $$('[data-del]', v).forEach((b) => { b.onclick = async () => {
    const u = lista.find((x) => x.id == b.dataset.del);
    if (!(await confirmar(`Remover o acesso de ${u.nome}?`, 'A pessoa não conseguirá mais entrar no sistema.'))) return;
    try { await api('DELETE', `/api/usuarios/${u.id}`); toast('Usuário removido'); telas.equipe(v); } catch (e) { toast(e.message, 'err'); }
  }; });
};

const TITULOS = { painel: 'Visão geral', alunos: 'Alunos', planos: 'Planos', matriculas: 'Matrículas', equipe: 'Equipe' };
async function atualizarContadores() {
  try {
    const d = await api('GET', '/api/dashboard');
    $('#c-alunos').textContent = d.alunos; $('#c-planos').textContent = d.planos; $('#c-mat').textContent = d.ativas;
  } catch {}
}
function rotear() {
  const nome = location.hash.slice(1);
  const tela = telas[nome] ? nome : 'painel';
  $('#crumb').textContent = TITULOS[tela];
  document.title = `${TITULOS[tela]} · FitGo`;
  $$('.nav a').forEach((a) => a.classList.toggle('ativo', a.dataset.view === tela));
  $('#sidebar').classList.remove('open');
  const v = $('#view');
  window.scrollTo({ top: 0 });
  telas[tela](v).catch((e) => { if (!/Sessão/.test(e.message)) v.innerHTML = vazio('Não foi possível carregar: ' + e.message, 'alert'); });
  atualizarContadores();
}
window.addEventListener('hashchange', () => { if (!$('#app').classList.contains('hidden')) rotear(); });

// ---------------- Início ----------------
pintarIcones();
api('GET', '/api/me').then(mostrarApp).catch(mostrarLogin);
