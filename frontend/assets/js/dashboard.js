document.addEventListener('DOMContentLoaded', async () => {
   
    await carregarResumo();
    await carregarUltimosPedidos();
    await carregarPizzasMaisVendidas();
  });
  
  async function carregarResumo() {
    try {
      const res = await fetch('/relatorios/resumo');
      const data = await res.json();
      
      document.getElementById('pedidos-hoje').textContent = data.pedidosHoje;
      document.getElementById('faturamento-hoje').textContent = 
        `R$ ${data.faturamentoHoje.toFixed(2)}`;
      document.getElementById('pedidos-andamento').textContent = data.pedidosAndamento;
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    }
  }
  
  async function carregarUltimosPedidos() {
    try {
      const res = await fetch('/pedidos?limit=5');
      const pedidos = await res.json();
      const tbody = document.querySelector('#ultimos-pedidos tbody');
      tbody.innerHTML = '';
      
      pedidos.forEach(pedido => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
          <td>#${pedido.id}</td>
          <td>${pedido.cliente_nome}</td>
          <td>R$ ${pedido.valor_total.toFixed(2)}</td>
          <td>
            <span class="status-badge ${getStatusClass(pedido.status)}">
              ${formatStatus(pedido.status)}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary" onclick="verPedido(${pedido.id})">
              Detalhes
            </button>
          </td>
        `;
        
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error('Erro ao carregar últimos pedidos:', error);
    }
  }
  
  async function carregarPizzasMaisVendidas() {
    try {
      const res = await fetch('/relatorios/pizzas-mais-vendidas');
      const pizzas = await res.json();
      
      const ctx = document.getElementById('pizzas-chart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: pizzas.map(p => p.nome),
          datasets: [{
            label: 'Quantidade Vendida',
            data: pizzas.map(p => p.quantidade),
            backgroundColor: 'rgba(231, 76, 60, 0.7)',
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar pizzas mais vendidas:', error);
    }
  }
  
 
  function getStatusClass(status) {
    const classes = {
      'aguardando_pagamento': 'status-warning',
      'pago_preparacao': 'status-info',
      'em_entrega': 'status-primary',
      'entregue': 'status-success',
      'cancelado': 'status-danger'
    };
    return classes[status] || '';
  }
  
  function formatStatus(status) {
    const names = {
      'aguardando_pagamento': 'Aguardando Pagamento',
      'pago_preparacao': 'Em Preparação',
      'em_entrega': 'Em Entrega',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return names[status] || status;
  }
  
  function verPedido(id) {
    window.location.href = `pedido-detalhes.html?id=${id}`;
  }