let clienteSelecionado = null;
let carrinho = [];
let pizzasDisponiveis = [];

async function buscarCliente() {
  const termo = document.getElementById('buscaCliente').value;
  const res = await fetch(`http://localhost:3000/clientes?busca=${termo}`);
  const clientes = await res.json();

  const div = document.getElementById('clienteSelecionado');
  div.innerHTML = '';

  if (clientes.length === 0) {
    div.textContent = 'Nenhum cliente encontrado.';
    clienteSelecionado = null;
    return;
  }

  const cliente = clientes[0];
  clienteSelecionado = cliente;
  div.innerHTML = `<p><strong>${cliente.nome}</strong> - ${cliente.telefone}</p>`;
}

async function carregarPizzas() {
  const res = await fetch('http://localhost:3000/pizzas/ativas');
  pizzasDisponiveis = await res.json();
  const container = document.getElementById('listaPizzas');
  container.innerHTML = '';

  pizzasDisponiveis.forEach(p => {
    const div = document.createElement('div');
    div.className = 'pizza';

    div.innerHTML = `
      <p><strong>${p.nome}</strong><br>R$ ${p.preco.toFixed(2)}</p>
      <label>Quantidade: <input type="number" id="qtd-${p.codigo}" min="0" value="0"></label>
    `;

    container.appendChild(div);
  });
}


function calcularTotal(pizzas, carrinho) {
  let total = 0;
  carrinho.forEach(item => {
    const pizza = pizzas.find(p => p.codigo === item.pizzaId);
    if (pizza) {
      total += pizza.preco * item.quantidade;
    }
  });
  return total;
}

function fecharPedido() {
  const formaPagamento = document.getElementById('pagamento').value;
  const numeroCartao = document.getElementById('numeroCartao').value;

  if (!clienteSelecionado) {
    alert("Selecione um cliente válido.");
    return;
  }

  carrinho = [];
  document.querySelectorAll('[id^="qtd-"]').forEach(input => {
    const qtd = parseInt(input.value);
    if (qtd > 0) {
      const pizzaId = parseInt(input.id.replace('qtd-', ''));
      carrinho.push({ pizzaId, quantidade: qtd });
    }
  });

  if (carrinho.length === 0) {
    alert("Adicione pelo menos uma pizza ao pedido.");
    return;
  }

  if (formaPagamento === 'cartao' && numeroCartao.length !== 16) {
    alert("Digite um número de cartão válido (16 dígitos).");
    return;
  }

 
  const total = calcularTotal(pizzasDisponiveis, carrinho);

  const pedido = {
    cliente_id: clienteSelecionado.codigo,
    itens: carrinho.map(p => ({
      pizza_id: p.pizzaId,
      quantidade: p.quantidade
    })),
    forma_pagamento: formaPagamento,
    valor_total: total,
    numeroCartao: formaPagamento === 'cartao' ? numeroCartao : null
  };

  fetch('http://localhost:3000/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedido)
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao enviar pedido");
      return res.json();
    })
    .then(() => {
      alert("Pedido realizado com sucesso!");
      window.location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Erro ao processar pedido.");
    });
}
