 express = require('express');
const app = express();
app.use(express.json());


const cartoes = [ 
  { id: 1, numero: '1234-5678-9012-3456', saldo: 1000, limite: 2000 },
  { id: 2, numero: '9876-5432-1098-7654', saldo: 500, limite: 1500 },
];


function aprovarCompra(cartao, valor) {
  if (cartao.saldo + valor <= cartao.limite) {
    cartao.saldo += valor;
    return true;
  } else {
    return false;
  }
}


app.post('/cartao/compras', (req, res) => {
  const { numeroCartao, valor } = req.body;
  const cartao = cartoes.find((c) => c.numero === numeroCartao);
  if (!cartao) {
    res.status(404).json({ mensagem: 'Cartão não encontrado' });
  } else if (aprovarCompra(cartao, valor)) {
    res.json({ mensagem: 'Compra aprovada', valor, saldo: cartao.saldo });
  } else {
    res.status(402).json({ mensagem: 'Compra não aprovada. Limite excedido.' });
  }
});


app.get('/cartao/saldo/:numeroCartao', (req, res) => {
  const { numeroCartao } = req.params;
  const cartao = cartoes.find((c) => c.numero === numeroCartao);
  if (!cartao) {
    res.status(404).json({ mensagem: 'Cartão não encontrado' });
  } else {
    res.json({ saldo: cartao.saldo, limite: cartao.limite });
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
