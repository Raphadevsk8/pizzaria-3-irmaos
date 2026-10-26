const express = require('express');
const router = express.Router();
const axios = require('axios');

const cartaoService = axios.create({
  baseURL: 'http://localhost:8080/cartao',
});

router.post('/', async (req, res, next) => {
  const { cliente_id, itens, forma_pagamento, valor_total, observacoes, numeroCartao } = req.body;
  
  try {
    
    if (!cliente_id || !itens || itens.length === 0 || !forma_pagamento || !valor_total) {
      return res.status(400).json({ error: 'Dados do pedido incompletos' });
    }
    
    if (forma_pagamento === 'cartao') {
      if (!numeroCartao || numeroCartao.length < 12) {
        return res.status(400).json({ error: 'Número do cartão inválido' });
      }
      
      try {
        await cartaoService.post('/compras', {
          numeroCartao,
          valor: valor_total,
        });
      } catch (err) {
        console.error('Erro no pagamento:', err.response?.data || err.message);
        return res.status(402).json({ 
          error: 'Pagamento recusado',
          details: err.response?.data || err.message
        });
      }
    }
    
   
    const connection = await req.db.getConnection();
    await connection.beginTransaction();
    
    try {
      
      const [pedidoResult] = await connection.query(
        `INSERT INTO pedidos 
        (cliente_id, status_id, forma_pagamento, valor_total, observacoes, data_hora_entrega) 
        VALUES (?, 1, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))`,
        [cliente_id, forma_pagamento, valor_total, observacoes]
      );
      
      const pedidoId = pedidoResult.insertId;
      
      
      for (const item of itens) {
        await connection.query(
          `INSERT INTO itens_pedido 
          (pedido_id, pizza_id, quantidade, preco_unitario) 
          VALUES (?, ?, ?, ?)`,
          [pedidoId, item.pizza_id, item.quantidade, item.preco]
        );
      }
      
      await connection.commit();
      res.status(201).json({ 
        pedidoId,
        message: 'Pedido criado com sucesso',
        tempo_entrega: '30 minutos'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
});



module.exports = router;