document.addEventListener('DOMContentLoaded', async () => {
    await carregarPedidosRecentes();
    await carregarPizzasPopulares();
    atualizarRelogio();
  });
  
  
  async function carregarPedidosRecentes() {
    try {
      const response = await fetch('/pedidos?limit=5');
      const pedidos = await response.json();
      const container = document.getElementById('pedidos-recentes');
      
      if (pedidos.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum pedido recente</p>';
        return;
      }
      
      let html = '';
      pedidos.forEach(pedido => {
        const statusClass = getStatusClass(pedido.status);
        const statusText = formatStatus(pedido.status);
        const dataHora = new Date(pedido.data_hora_pedido).toLocaleString();
        
        html += `
          <div class="status-item">
            <div class="status-info">
              <span class="pedido-id">#${pedido.id}</span>
              <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="status-details">
              <span>${pedido.cliente_nome || 'Cliente não informado'}</span>
              <span>R$ ${pedido.valor_total.toFixed(2)}</span>
            </div>
            <div class="status-time">${dataHora}</div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    } catch (error) {
      console.error('Erro ao carregar pedidos recentes:', error);
      document.getElementById('pedidos-recentes').innerHTML = 
        '<p class="error-message">Erro ao carregar pedidos</p>';
    }
  }
  
 
  async function carregarPizzasPopulares() {
    try {
      const response = await fetch('/relatorios/pizzas-mais-vendidas?limit=3');
      const pizzas = await response.json();
      const container = document.getElementById('pizzas-populares');
      
      if (pizzas.length === 0) {
        container.innerHTML = '<p class="empty-message">Nenhum dado disponível</p>';
        return;
      }
      
      let html = '';
      pizzas.forEach((pizza, index) => {
        html += `
          <div class="status-item">
            <div class="pizza-rank">${index + 1}º</div>
            <div class="pizza-info">
              <span class="pizza-name">${pizza.nome}</span>
              <span class="pizza-sales">${pizza.quantidade} vendas</span>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
    } catch (error) {
      console.error('Erro ao carregar pizzas populares:', error);
      document.getElementById('pizzas-populares').innerHTML = 
        '<p class="error-message">Erro ao carregar dados</p>';
    }
  }
  
  
  function atualizarRelogio() {
    function update() {
      const now = new Date();
      document.getElementById('relogio').textContent = 
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    
   
    if (!document.getElementById('relogio')) {
      const clock = document.createElement('div');
      clock.id = 'relogio';
      clock.className = 'relogio';
      document.querySelector('.header .container').appendChild(clock);
    }
    
    update();
    setInterval(update, 60000);
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