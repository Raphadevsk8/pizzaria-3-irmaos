const api = 'http://localhost:3000/pizzas';

document.getElementById('pizza-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const pizza = {
    nome: document.getElementById('nome').value,
    ingredientes: document.getElementById('ingredientes').value,
    imagem: document.getElementById('imagem').value,
    preco: parseFloat(document.getElementById('preco').value),
    status: document.getElementById('status').value
  };

  const codigo = document.getElementById('codigo').value;

  if (codigo) {
    await fetch(`${api}/${codigo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pizza)
    });
  } else {
    await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pizza)
    });
  }

  limparFormulario();
  carregarPizzas();
});

function limparFormulario() {
  document.getElementById('codigo').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('ingredientes').value = '';
  document.getElementById('imagem').value = '';
  document.getElementById('preco').value = '';
  document.getElementById('status').value = 'ativo';
}

async function carregarPizzas() {
  const res = await fetch(api);
  const pizzas = await res.json();
  mostrarPizzas(pizzas);
}

function mostrarPizzas(pizzas) {
  const tbody = document.getElementById('lista-pizzas');
  tbody.innerHTML = '';

  pizzas.forEach(p => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.ingredientes}</td>
      <td>${p.imagem}</td>
      <td>R$ ${p.preco.toFixed(2)}</td>
      <td>${p.status}</td>
      <td>
        <button onclick="editarPizza(${p.codigo})">Editar</button>
        <button onclick="desativarPizza(${p.codigo})">Desativar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function editarPizza(codigo) {
  const res = await fetch(api);
  const pizzas = await res.json();
  const pizza = pizzas.find(p => p.codigo === codigo);

  document.getElementById('codigo').value = pizza.codigo;
  document.getElementById('nome').value = pizza.nome;
  document.getElementById('ingredientes').value = pizza.ingredientes;
  document.getElementById('imagem').value = pizza.imagem;
  document.getElementById('preco').value = pizza.preco;
  document.getElementById('status').value = pizza.status;
}

async function desativarPizza(codigo) {
  if (confirm('Deseja realmente desativar esta pizza?')) {
    await fetch(`${api}/${codigo}/desativar`, {
      method: 'PATCH'
    });
    carregarPizzas();
  }
}

carregarPizzas();
