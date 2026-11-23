// Banco de dados SQLite (módulo nativo do Node.js 22: node:sqlite)
const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function hashSenha(senha, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function conferirSenha(senha, salvo) {
  const [salt, hash] = salvo.split(':');
  const teste = crypto.scryptSync(senha, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(teste, 'hex'));
}

function abrirBanco(arquivo) {
  if (arquivo !== ':memory:') fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  const db = new DatabaseSync(arquivo);
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL DEFAULT 'admin'
    );

    CREATE TABLE IF NOT EXISTS sessoes (
      token TEXT PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS planos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL CHECK (preco >= 0),
      duracao_meses INTEGER NOT NULL CHECK (duracao_meses > 0),
      descricao TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL UNIQUE,
      telefone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      nascimento TEXT DEFAULT '',
      criado_em TEXT NOT NULL DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS matriculas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      plano_id INTEGER NOT NULL REFERENCES planos(id),
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      valor REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada'))
    );
  `);

  // Dados iniciais (só na primeira vez)
  const temUsuario = db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n;
  if (!temUsuario) {
    db.prepare('INSERT INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, ?)')
      .run('Administrador', 'admin', hashSenha('academia123'), 'admin');

    const plano = db.prepare('INSERT INTO planos (nome, preco, duracao_meses, descricao) VALUES (?, ?, ?, ?)');
    plano.run('Mensal', 99.9, 1, 'Acesso livre à musculação');
    plano.run('Trimestral', 89.9, 3, 'Musculação + aulas coletivas');
    plano.run('Anual', 69.9, 12, 'Plano completo com avaliação física');

    const aluno = db.prepare('INSERT INTO alunos (nome, cpf, telefone, email, nascimento) VALUES (?, ?, ?, ?, ?)');
    aluno.run('Ana Souza', '111.222.333-44', '(85) 98888-1111', 'ana@email.com', '2001-04-12');
    aluno.run('Bruno Lima', '222.333.444-55', '(85) 98888-2222', 'bruno@email.com', '1998-09-30');
    aluno.run('Carla Mendes', '333.444.555-66', '(85) 98888-3333', 'carla@email.com', '2003-01-05');

    const hoje = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const somarMeses = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
    const mat = db.prepare('INSERT INTO matriculas (aluno_id, plano_id, inicio, fim, valor, status) VALUES (?, ?, ?, ?, ?, ?)');
    mat.run(1, 3, iso(hoje), iso(somarMeses(hoje, 12)), 69.9, 'ativa');
    mat.run(2, 1, iso(somarMeses(hoje, -1)), iso(new Date(hoje.getTime() + 5 * 864e5)), 99.9, 'ativa');
  }
  return db;
}

module.exports = { abrirBanco, hashSenha, conferirSenha };
