// Backend - API REST do sistema da academia "FitGo"
// Node.js puro (módulo http) + SQLite nativo (node:sqlite). Sem dependências externas.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { abrirBanco, conferirSenha, hashSenha } = require('./db');

const FRONTEND = path.join(__dirname, '..', 'frontend');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

function criarServidor(arquivoBanco) {
  const db = abrirBanco(arquivoBanco);

  // ---------- utilitários ----------
  const json = (res, status, dados) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(dados));
  };
  const lerCorpo = (req) => new Promise((ok, erro) => {
    let corpo = '';
    req.on('data', (c) => { corpo += c; if (corpo.length > 1e6) req.destroy(); });
    req.on('end', () => { try { ok(corpo ? JSON.parse(corpo) : {}); } catch { erro(new Error('JSON inválido')); } });
  });
  const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean)
    .map((c) => c.trim().split('=').map(decodeURIComponent)));
  const usuarioLogado = (req) => {
    const token = cookies(req).sessao;
    if (!token) return null;
    return db.prepare(`SELECT u.id, u.nome, u.usuario, u.perfil FROM sessoes s
      JOIN usuarios u ON u.id = s.usuario_id WHERE s.token = ?`).get(token) || null;
  };
  const obrigatorio = (obj, campos) => {
    const faltando = campos.filter((c) => obj[c] === undefined || obj[c] === null || String(obj[c]).trim() === '');
    if (faltando.length) throw Object.assign(new Error('Preencha: ' + faltando.join(', ')), { status: 400 });
  };
  const addMeses = (data, meses) => {
    const d = new Date(data + 'T00:00:00');
    d.setMonth(d.getMonth() + Number(meses));
    return d.toISOString().slice(0, 10);
  };

  // ---------- rotas ----------
  const rotas = [];
  // publica: não exige login · admin: só o perfil 'admin' pode usar (autorização)
  const rota = (metodo, padrao, publica, fn, admin = false) => {
    const chaves = [];
    const regex = new RegExp('^' + padrao.replace(/:(\w+)/g, (_, k) => { chaves.push(k); return '(\\d+)'; }) + '$');
    rotas.push({ metodo, regex, chaves, publica, fn, admin });
  };

  // Autenticação
  rota('POST', '/api/login', true, async (req, res) => {
    const { usuario, senha } = await lerCorpo(req);
    const u = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(String(usuario || ''));
    if (!u || !conferirSenha(String(senha || ''), u.senha)) return json(res, 401, { erro: 'Usuário ou senha inválidos' });
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO sessoes (token, usuario_id) VALUES (?, ?)').run(token, u.id);
    res.setHeader('Set-Cookie', `sessao=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=28800`);
    json(res, 200, { nome: u.nome, perfil: u.perfil });
  });
  rota('POST', '/api/logout', true, async (req, res) => {
    const token = cookies(req).sessao;
    if (token) db.prepare('DELETE FROM sessoes WHERE token = ?').run(token);
    res.setHeader('Set-Cookie', 'sessao=; HttpOnly; Path=/; Max-Age=0');
    json(res, 200, { ok: true });
  });
  rota('GET', '/api/me', false, async (req, res, p, user) => json(res, 200, user));

  // Usuários da equipe (somente admin)
  rota('GET', '/api/usuarios', false, async (req, res) =>
    json(res, 200, db.prepare('SELECT id, nome, usuario, perfil FROM usuarios ORDER BY id').all()), true);
  rota('POST', '/api/usuarios', false, async (req, res) => {
    const b = await lerCorpo(req); obrigatorio(b, ['nome', 'usuario', 'senha', 'perfil']);
    if (!['admin', 'recepcao'].includes(b.perfil)) return json(res, 400, { erro: 'Perfil inválido' });
    if (String(b.senha).length < 6) return json(res, 400, { erro: 'A senha precisa de pelo menos 6 caracteres' });
    if (db.prepare('SELECT 1 FROM usuarios WHERE usuario = ?').get(b.usuario.trim())) return json(res, 409, { erro: 'Usuário já existe' });
    const r = db.prepare('INSERT INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, ?)')
      .run(b.nome.trim(), b.usuario.trim(), hashSenha(String(b.senha)), b.perfil);
    json(res, 201, db.prepare('SELECT id, nome, usuario, perfil FROM usuarios WHERE id = ?').get(r.lastInsertRowid));
  }, true);
  rota('DELETE', '/api/usuarios/:id', false, async (req, res, p, user) => {
    if (Number(p.id) === user.id) return json(res, 400, { erro: 'Você não pode excluir o próprio usuário' });
    const r = db.prepare('DELETE FROM usuarios WHERE id = ?').run(p.id);
    json(res, r.changes ? 200 : 404, r.changes ? { ok: true } : { erro: 'Usuário não encontrado' });
  }, true);

  // Painel (dashboard)
  rota('GET', '/api/dashboard', false, async (req, res) => {
    const hoje = new Date().toISOString().slice(0, 10);
    const em7 = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const n = (sql, ...a) => db.prepare(sql).get(...a).n;
    json(res, 200, {
      alunos: n('SELECT COUNT(*) AS n FROM alunos'),
      planos: n('SELECT COUNT(*) AS n FROM planos'),
      ativas: n("SELECT COUNT(*) AS n FROM matriculas WHERE status='ativa' AND fim >= ?", hoje),
      receita: n("SELECT COALESCE(SUM(valor),0) AS n FROM matriculas WHERE status='ativa' AND fim >= ?", hoje),
      vencendo: db.prepare(`SELECT m.id, a.nome AS aluno, p.nome AS plano, m.fim FROM matriculas m
        JOIN alunos a ON a.id=m.aluno_id JOIN planos p ON p.id=m.plano_id
        WHERE m.status='ativa' AND m.fim BETWEEN ? AND ? ORDER BY m.fim`).all(hoje, em7),
      recentes: db.prepare(`SELECT m.id, a.nome AS aluno, p.nome AS plano, m.inicio, m.valor, m.status FROM matriculas m
        JOIN alunos a ON a.id=m.aluno_id JOIN planos p ON p.id=m.plano_id ORDER BY m.inicio DESC, m.id DESC LIMIT 5`).all(),
      // novas matrículas por mês (últimos 6 meses) - gráfico de barras
      porMes: (() => {
        const meses = [];
        const d = new Date(); d.setDate(1);
        for (let i = 5; i >= 0; i--) {
          const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
          meses.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
        }
        const linhas = db.prepare(`SELECT substr(inicio,1,7) AS mes, COUNT(*) AS total, SUM(valor) AS valor
          FROM matriculas WHERE substr(inicio,1,7) >= ? GROUP BY mes`).all(meses[0]);
        return meses.map((mes) => {
          const l = linhas.find((x) => x.mes === mes);
          return { mes, total: l ? l.total : 0, valor: l ? l.valor : 0 };
        });
      })(),
      // matrículas ativas por plano - gráfico de rosca
      porPlano: db.prepare(`SELECT p.nome AS plano, COUNT(m.id) AS total FROM planos p
        LEFT JOIN matriculas m ON m.plano_id=p.id AND m.status='ativa' AND m.fim >= ?
        GROUP BY p.id ORDER BY total DESC`).all(hoje)
    });
  });

  // CRUD de alunos
  rota('GET', '/api/alunos', false, async (req, res) => {
    const hoje = new Date().toISOString().slice(0, 10);
    json(res, 200, db.prepare(`SELECT a.*,
      (SELECT p.nome FROM matriculas m JOIN planos p ON p.id=m.plano_id
        WHERE m.aluno_id=a.id AND m.status='ativa' AND m.fim >= ? ORDER BY m.fim DESC LIMIT 1) AS plano_atual
      FROM alunos a ORDER BY a.nome`).all(hoje));
  });
  rota('GET', '/api/alunos/:id', false, async (req, res, p) => {
    const aluno = db.prepare('SELECT * FROM alunos WHERE id = ?').get(p.id);
    if (!aluno) return json(res, 404, { erro: 'Aluno não encontrado' });
    aluno.matriculas = db.prepare(`SELECT m.*, pl.nome AS plano FROM matriculas m
      JOIN planos pl ON pl.id=m.plano_id WHERE m.aluno_id = ? ORDER BY m.inicio DESC`).all(p.id);
    json(res, 200, aluno);
  });
  rota('POST', '/api/alunos', false, async (req, res) => {
    const b = await lerCorpo(req); obrigatorio(b, ['nome', 'cpf']);
    const r = db.prepare('INSERT INTO alunos (nome, cpf, telefone, email, nascimento) VALUES (?, ?, ?, ?, ?)')
      .run(b.nome.trim(), b.cpf.trim(), b.telefone || '', b.email || '', b.nascimento || '');
    json(res, 201, db.prepare('SELECT * FROM alunos WHERE id = ?').get(r.lastInsertRowid));
  });
  rota('PUT', '/api/alunos/:id', false, async (req, res, p) => {
    const b = await lerCorpo(req); obrigatorio(b, ['nome', 'cpf']);
    const r = db.prepare('UPDATE alunos SET nome=?, cpf=?, telefone=?, email=?, nascimento=? WHERE id=?')
      .run(b.nome.trim(), b.cpf.trim(), b.telefone || '', b.email || '', b.nascimento || '', p.id);
    if (!r.changes) return json(res, 404, { erro: 'Aluno não encontrado' });
    json(res, 200, db.prepare('SELECT * FROM alunos WHERE id = ?').get(p.id));
  });
  rota('DELETE', '/api/alunos/:id', false, async (req, res, p) => {
    const r = db.prepare('DELETE FROM alunos WHERE id = ?').run(p.id);
    json(res, r.changes ? 200 : 404, r.changes ? { ok: true } : { erro: 'Aluno não encontrado' });
  }, true);

  // CRUD de planos
  rota('GET', '/api/planos', false, async (req, res) => {
    const hoje = new Date().toISOString().slice(0, 10);
    json(res, 200, db.prepare(`SELECT p.*,
      (SELECT COUNT(*) FROM matriculas m WHERE m.plano_id=p.id AND m.status='ativa' AND m.fim >= ?) AS ativos
      FROM planos p ORDER BY p.preco`).all(hoje));
  });
  rota('POST', '/api/planos', false, async (req, res) => {
    const b = await lerCorpo(req); obrigatorio(b, ['nome', 'preco', 'duracao_meses']);
    const r = db.prepare('INSERT INTO planos (nome, preco, duracao_meses, descricao) VALUES (?, ?, ?, ?)')
      .run(b.nome.trim(), Number(b.preco), Number(b.duracao_meses), b.descricao || '');
    json(res, 201, db.prepare('SELECT * FROM planos WHERE id = ?').get(r.lastInsertRowid));
  }, true);
  rota('PUT', '/api/planos/:id', false, async (req, res, p) => {
    const b = await lerCorpo(req); obrigatorio(b, ['nome', 'preco', 'duracao_meses']);
    const r = db.prepare('UPDATE planos SET nome=?, preco=?, duracao_meses=?, descricao=? WHERE id=?')
      .run(b.nome.trim(), Number(b.preco), Number(b.duracao_meses), b.descricao || '', p.id);
    if (!r.changes) return json(res, 404, { erro: 'Plano não encontrado' });
    json(res, 200, db.prepare('SELECT * FROM planos WHERE id = ?').get(p.id));
  }, true);
  rota('DELETE', '/api/planos/:id', false, async (req, res, p) => {
    const emUso = db.prepare('SELECT COUNT(*) AS n FROM matriculas WHERE plano_id = ?').get(p.id).n;
    if (emUso) return json(res, 409, { erro: 'Plano possui matrículas e não pode ser excluído' });
    const r = db.prepare('DELETE FROM planos WHERE id = ?').run(p.id);
    json(res, r.changes ? 200 : 404, r.changes ? { ok: true } : { erro: 'Plano não encontrado' });
  }, true);

  // Matrículas
  const SQL_MAT = `SELECT m.*, a.nome AS aluno, p.nome AS plano FROM matriculas m
    JOIN alunos a ON a.id=m.aluno_id JOIN planos p ON p.id=m.plano_id`;
  rota('GET', '/api/matriculas', false, async (req, res) => json(res, 200, db.prepare(SQL_MAT + ' ORDER BY m.id DESC').all()));
  rota('POST', '/api/matriculas', false, async (req, res) => {
    const b = await lerCorpo(req); obrigatorio(b, ['aluno_id', 'plano_id']);
    const plano = db.prepare('SELECT * FROM planos WHERE id = ?').get(Number(b.plano_id));
    const aluno = db.prepare('SELECT id FROM alunos WHERE id = ?').get(Number(b.aluno_id));
    if (!plano || !aluno) return json(res, 400, { erro: 'Aluno ou plano inválido' });
    const inicio = b.inicio || new Date().toISOString().slice(0, 10);
    const r = db.prepare('INSERT INTO matriculas (aluno_id, plano_id, inicio, fim, valor) VALUES (?, ?, ?, ?, ?)')
      .run(aluno.id, plano.id, inicio, addMeses(inicio, plano.duracao_meses), plano.preco);
    json(res, 201, db.prepare(SQL_MAT + ' WHERE m.id = ?').get(r.lastInsertRowid));
  });
  rota('PUT', '/api/matriculas/:id/cancelar', false, async (req, res, p) => {
    const r = db.prepare("UPDATE matriculas SET status='cancelada' WHERE id = ?").run(p.id);
    json(res, r.changes ? 200 : 404, r.changes ? { ok: true } : { erro: 'Matrícula não encontrada' });
  }, true);
  rota('PUT', '/api/matriculas/:id/renovar', false, async (req, res, p) => {
    const m = db.prepare('SELECT m.*, p.duracao_meses, p.preco FROM matriculas m JOIN planos p ON p.id=m.plano_id WHERE m.id = ?').get(p.id);
    if (!m) return json(res, 404, { erro: 'Matrícula não encontrada' });
    const hoje = new Date().toISOString().slice(0, 10);
    const base = m.fim > hoje ? m.fim : hoje;
    db.prepare("UPDATE matriculas SET fim=?, valor=?, status='ativa' WHERE id=?").run(addMeses(base, m.duracao_meses), m.preco, p.id);
    json(res, 200, db.prepare(SQL_MAT + ' WHERE m.id = ?').get(p.id));
  });

  rota('GET', '/health', true, async (req, res) => json(res, 200, { status: 'ok', uptime: Math.round(process.uptime()) + 's' }));

  // ---------- servidor ----------
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const caminho = url.pathname;

    if (caminho.startsWith('/api/') || caminho === '/health') {
      for (const r of rotas) {
        const m = caminho.match(r.regex);
        if (!m || r.metodo !== req.method) continue;
        const params = Object.fromEntries(r.chaves.map((k, i) => [k, Number(m[i + 1])]));
        const user = usuarioLogado(req);
        if (!r.publica && !user) return json(res, 401, { erro: 'Faça login para continuar' });
        if (r.admin && user.perfil !== 'admin') return json(res, 403, { erro: 'Seu perfil não tem permissão para esta ação' });
        try { return await r.fn(req, res, params, user); }
        catch (e) {
          const msg = /UNIQUE/.test(e.message) ? 'Já existe um registro com esse CPF' : e.message;
          return json(res, e.status || 400, { erro: msg });
        }
      }
      return json(res, 404, { erro: 'Rota não encontrada' });
    }

    // Arquivos do frontend
    let arquivo = path.normalize(path.join(FRONTEND, caminho === '/' ? 'index.html' : caminho));
    if (!arquivo.startsWith(FRONTEND)) { res.writeHead(403); return res.end(); }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) { res.writeHead(404); return res.end('Não encontrado'); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
      res.end(dados);
    });
  });
}

if (require.main === module) {
  const PORT = process.env.PORT || 80;
  criarServidor(path.join(__dirname, 'data', 'academia.db'))
    .listen(PORT, () => console.log(`FitGo rodando na porta ${PORT}`));
}

module.exports = { criarServidor };
