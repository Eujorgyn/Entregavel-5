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
    plano.run('Premium', 149.9, 1, 'Personal trainer + todas as modalidades');

    const aluno = db.prepare('INSERT INTO alunos (nome, cpf, telefone, email, nascimento) VALUES (?, ?, ?, ?, ?)');
    const alunos = [
      ['Ana Souza', '111.222.333-44', '2001-04-12'], ['Bruno Lima', '222.333.444-55', '1998-09-30'],
      ['Carla Mendes', '333.444.555-66', '2003-01-05'], ['Diego Rocha', '444.555.666-77', '1995-07-21'],
      ['Elisa Martins', '555.666.777-88', '2000-11-02'], ['Felipe Araújo', '666.777.888-99', '1999-03-17'],
      ['Gabriela Nunes', '777.888.999-00', '2002-06-08'], ['Henrique Castro', '888.999.000-11', '1993-12-25'],
      ['Isabela Freitas', '999.000.111-22', '2004-02-14'], ['João Pedro Alves', '012.345.678-90', '1997-08-09'],
      ['Larissa Costa', '123.456.789-01', '2001-10-30'], ['Marcos Vieira', '234.567.890-12', '1990-05-03']
    ];
    alunos.forEach(([nome, cpf, nasc], i) => {
      const tel = `(85) 9${String(8000 + i * 137).padStart(4, '0')}-${String(1000 + i * 311).slice(0, 4)}`;
      aluno.run(nome, cpf, tel, nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@email.com', nasc);
    });

    // Matrículas espalhadas nos últimos meses (para os gráficos do painel)
    const hoje = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const somarMeses = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
    const somarDias = (d, n) => new Date(d.getTime() + n * 864e5);
    const mat = db.prepare('INSERT INTO matriculas (aluno_id, plano_id, inicio, fim, valor, status) VALUES (?, ?, ?, ?, ?, ?)');
    const precos = { 1: 99.9, 2: 89.9, 3: 69.9, 4: 149.9 };
    const duracao = { 1: 1, 2: 3, 3: 12, 4: 1 };
    // [aluno, plano, meses atrás, dias, status]
    [
      [1, 3, 0, 0, 'ativa'], [2, 1, 1, 0, 'ativa'], [4, 3, 5, 3, 'ativa'], [5, 2, 2, 10, 'ativa'],
      [6, 4, 0, 5, 'ativa'], [7, 3, 4, 12, 'ativa'], [8, 1, 3, 2, 'cancelada'], [9, 2, 1, 15, 'ativa'],
      [10, 3, 2, 20, 'ativa'], [11, 4, 0, 12, 'ativa'], [12, 2, 5, 25, 'cancelada']
    ].forEach(([a, p, mesesAtras, dias, status]) => {
      const inicio = somarDias(somarMeses(hoje, -mesesAtras), -dias);
      let fim = somarMeses(inicio, duracao[p]);
      if (a === 2) fim = somarDias(hoje, 5); // uma matrícula vencendo esta semana
      mat.run(a, p, iso(inicio), iso(fim), precos[p], status);
    });
  }
  return db;
}

module.exports = { abrirBanco, hashSenha, conferirSenha };
