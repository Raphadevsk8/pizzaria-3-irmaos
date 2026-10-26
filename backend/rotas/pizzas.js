const express = require('express');
const router = express.Router();

const validatePizza = (pizza) => {
  const errors = [];
  if (!pizza.nome || pizza.nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }
  if (!pizza.ingredientes || pizza.ingredientes.trim().length === 0) {
    errors.push('Ingredientes são obrigatórios');
  }
  if (!pizza.preco || isNaN(pizza.preco) || pizza.preco <= 0) {
    errors.push('Preço inválido');
  }
  return errors;
};

router.get('/', async (req, res, next) => {
  try {
    const [pizzas] = await req.db.query(`
      SELECT * FROM pizzas 
      WHERE status = 'ativo'
      ORDER BY categoria, nome
    `);
    res.json(pizzas);
  } catch (err) {
    next(err);
  }
});

router.get('/destaques', async (req, res, next) => {
  try {
    const [pizzas] = await req.db.query(`
      SELECT * FROM pizzas 
      WHERE destaque = TRUE AND status = 'ativo'
      ORDER BY nome
    `);
    res.json(pizzas);
  } catch (err) {
    next(err);
  }
});

router.get('/ativas', async (req, res, next) => {
  try {
    const [pizzas] = await req.db.query(`
      SELECT codigo, nome, preco FROM pizzas 
      WHERE status = 'ativo'
      ORDER BY nome
    `);
    res.json(pizzas);
  } catch (err) {
    next(err);
  }
});


module.exports = router;