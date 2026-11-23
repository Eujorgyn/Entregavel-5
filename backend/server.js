// Backend - API da calculadora (Node.js + Express)
// Também serve os arquivos do frontend (pasta ../frontend).
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Operações suportadas
const operacoes = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => {
    if (b === 0) throw new Error('Divisão por zero');
    return a / b;
  }
};

// POST /api/calcular  { a, b, op }  ->  { resultado }  ou  { erro }
app.post('/api/calcular', (req, res) => {
  const { a, b, op } = req.body;
  const n1 = Number(a);
  const n2 = Number(b);

  if (a === '' || b === '' || a == null || b == null || !Number.isFinite(n1) || !Number.isFinite(n2)) {
    return res.status(400).json({ erro: 'Digite dois números válidos' });
  }
  if (!operacoes[op]) {
    return res.status(400).json({ erro: 'Operação inválida' });
  }

  try {
    const resultado = operacoes[op](n1, n2);
    res.json({ resultado: Math.round(resultado * 1e10) / 1e10 });
  } catch (e) {
    res.status(400).json({ erro: e.message });
  }
});

// GET /health -> status do servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()) + 's' });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
