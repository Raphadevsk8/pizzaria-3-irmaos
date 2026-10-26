const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const caminhoPedidos = path.join(__dirname, 'data', 'pedidos.json');
const caminhoPizzas = path.join(__dirname, 'data', 'pizzas.json');
const caminhoClientes = path.join(__dirname, 'data', 'clientes.json');

function lerPedidos() {
  return JSON.parse(fs.readFileSync(caminhoPedidos));
}

function lerPizzas() {
  return JSON.parse(fs.readFileSync(caminhoPizzas));
}

function lerClientes() {
  return JSON.parse(fs.readFileSync(caminhoClientes));
}

function salvarPedidos(pedidos) {
  fs.writeFileSync(caminhoPedidos, JSON.stringify(pedidos, null, 2));
}

router.get('/', (req, res) => {
  const pedidos = lerPedidos();
  res.json(pedidos);
});

router.post('/', (req, res) => {
  const pedidos = lerPedidos();
  const novo = req.body;
  novo.numero = pedidos.length > 0 ? pedidos[pedidos.length - 1].numero + 1 : 1;
  novo.dataHora = new Date();
  pedidos.push(novo);
  salvarPedidos(pedidos);
  res.status(201).json(novo);
});

router.get('/cliente/:codigo', (req, res) => {
  const { codigo } = req.params;
  const pedidos = lerPedidos();
  const pizzas = lerPizzas();
  const historico = pedidos.filter(p => p.codigoCliente == codigo);

  const resultado = historico.map(p => {
    const itensDetalhados = p.itens.map(i => {
      const pizza = pizzas.find(pz => pz.codigo == i.codigoPizza);
      return {
        nome: pizza ? pizza.nome : 'Desconhecida',
        qtde: i.qtde
      };
    });
    return {
      numero: p.numero,
      dataHora: p.dataHora,
      valorTotal: p.valorTotal,
      status: p.status,
      pagamento: p.pagamento,
      itens: itensDetalhados
    };
  });

  res.json(resultado);
});

router.put('/:numero/status', (req, res) => {
  const { numero } = req.params;
  const { status } = req.body;
  const pedidos = lerPedidos();
  const pedido = pedidos.find(p => p.numero == numero);

  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

  pedido.status = status;
  if (status.toLowerCase() === 'pedido atendido e entregue') {
    pedido.dataEntrega = new Date();
  }

  salvarPedidos(pedidos);
  res.json({ sucesso: true, pedido });
});

module.exports = router;
