const api = 'http://localhost:3000/clientes';

document.getElementById('cliente-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cliente = {
    nome: document.getElementById('nome').value,
    telefone: document.getElementById('telefone').value,
    endereco: document.getElementById('endereco').value,
    status: document.getElementById('status').value
  };

  const codigo = document.getElementById('codigo').value;

  if (codigo) {
    await fetch(`${api}/${codigo}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
  } else {
    await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
  }

  limparFormulario();
  buscarClientes();
});

function limparFormulario() {
  document.getElementById('codigo').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('telefone').value = '';
  document.getElementById('endereco').value = '';
  document.getElementById('status').value = 'ativo';
}

async function buscarClientes() {
  const termo = document.getElementById('busca').value;
  const res = await fetch(`${api}/buscar?nome=${termo}&telefone=${termo}`);
  const clientes = await res.json();
  mostrarClientes(clientes);
}

function mostrarClientes(clientes) {
  const tbody = document.getElementById('lista-clientes');
  tbody.innerHTML = '';

  clientes.forEach(c => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.telefone}</td>
      <td>${c.endereco}</td>
      <td>${c.status}</td>
      <td>
        <button onclick="editarCliente(${c.codigo})">Editar</button>
        <button onclick="desativarCliente(${c.codigo})">Desativar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function editarCliente(codigo) {
  const res = await fetch(`${api}`);
  const lista = await res.json();
  const cliente = lista.find(c => c.codigo === codigo);

  document.getElementById('codigo').value = cliente.codigo;
  document.getElementById('nome').value = cliente.nome;
  document.getElementById('telefone').value = cliente.telefone;
  document.getElementById('endereco').value = cliente.endereco;
  document.getElementById('status').value = cliente.status;
}

async function desativarCliente(codigo) {
  if (confirm('Deseja realmente desativar este cliente?')) {
    await fetch(`${api}/${codigo}/desativar`, {
      method: 'PATCH'
    });
    buscarClientes();
  }
}


buscarClientes();
