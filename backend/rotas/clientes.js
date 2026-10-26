const express = require('express');
const router = express.Router();

const validateCliente = (cliente) => {
  const errors = [];
  if (!cliente.nome || cliente.nome.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  }
  if (!cliente.telefone || cliente.telefone.trim().length < 8) {
    errors.push('Telefone inválido');
  }
  return errors;
};

router.get('/', async (req, res, next) => {
  try {
    const [clientes] = await req.db.query('SELECT * FROM clientes ORDER BY nome');
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

router.get('/buscar', async (req, res, next) => {
  try {
    const { nome, telefone } = req.query;
    let sql = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    
    if (nome) {
      sql += ' AND nome LIKE ?';
      params.push(`%${nome}%`);
    }
    if (telefone) {
      sql += ' AND telefone LIKE ?';
      params.push(`%${telefone}%`);
    }
    
    sql += ' ORDER BY nome';
    const [clientes] = await req.db.query(sql, params);
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { nome, telefone, endereco, status = 'ativo' } = req.body;
    const errors = validateCliente({ nome, telefone });
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    const [result] = await req.db.query(
      'INSERT INTO clientes (nome, telefone, endereco, status) VALUES (?, ?, ?, ?)',
      [nome, telefone, endereco, status]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Cliente cadastrado com sucesso'
    });
  } catch (err) {
    next(err);
  }
});



module.exports = router;