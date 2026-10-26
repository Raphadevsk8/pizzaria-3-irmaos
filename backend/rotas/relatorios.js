const express = require('express');
const router = express.Router();

router.get('/resumo', async (req, res, next) => {
  try {
   
    const [pedidosHoje] = await req.db.query(`
      SELECT COUNT(*) as total 
      FROM pedidos 
      WHERE DATE(data_hora_pedido) = CURDATE()
    `);
    
    
    const [faturamentoHoje] = await req.db.query(`
      SELECT COALESCE(SUM(valor_total), 0) as total 
      FROM pedidos 
      WHERE DATE(data_hora_pedido) = CURDATE()
    `);
    
    const [pedidosAndamento] = await req.db.query(`
      SELECT COUNT(*) as total 
      FROM pedidos 
      WHERE status_id IN (1, 2, 3) 
      AND DATE(data_hora_pedido) = CURDATE()
    `);
    
    res.json({
      pedidosHoje: pedidosHoje[0].total,
      faturamentoHoje: parseFloat(faturamentoHoje[0].total),
      pedidosAndamento: pedidosAndamento[0].total
    });
  } catch (err) {
    next(err);
  }
});

router.get('/pizzas-mais-vendidas', async (req, res, next) => {
  try {
    const [pizzas] = await req.db.query(`
      SELECT p.codigo, p.nome, SUM(ip.quantidade) as quantidade
      FROM itens_pedido ip
      JOIN pizzas p ON ip.pizza_id = p.codigo
      JOIN pedidos pd ON ip.pedido_id = pd.id
      WHERE pd.data_hora_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY p.codigo, p.nome
      ORDER BY quantidade DESC
      LIMIT 5
    `);
    
    res.json(pizzas);
  } catch (err) {
    next(err);
  }
});

module.exports = router;