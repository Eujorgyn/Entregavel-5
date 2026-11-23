// Frontend - envia os números para a API do backend e mostra o resultado
const simbolos = { '+': '+', '-': '−', '*': '×', '/': '÷' };
const $ = (id) => document.getElementById(id);

document.querySelectorAll('[data-op]').forEach((botao) => {
  botao.addEventListener('click', async () => {
    document.querySelectorAll('[data-op]').forEach((b) => b.classList.remove('on'));
    botao.classList.add('on');

    const a = $('a').value;
    const b = $('b').value;
    const op = botao.dataset.op;

    const resposta = await fetch('/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a, b, op })
    });
    const dados = await resposta.json();
    const res = $('res');

    if (dados.erro) {
      res.textContent = dados.erro;
      res.classList.add('err');
      $('expr').innerHTML = '&nbsp;';
      return;
    }

    const valor = dados.resultado.toLocaleString('pt-BR');
    const expressao = `${a} ${simbolos[op]} ${b}`;

    res.classList.remove('err');
    res.textContent = valor;
    $('expr').textContent = `${expressao} =`;

    const item = document.createElement('li');
    item.innerHTML = `<span>${expressao}</span><span>${valor}</span>`;
    $('hist').prepend(item);
  });
});
