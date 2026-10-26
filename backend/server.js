const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


app.use((req, res, next) => {
  req.db = pool;
  next();
});


const clientesRoute = require('./rotas/clientes');
const pizzasRoute = require('./rotas/pizzas');
const pedidosRoute = require('./rotas/pedidos');
const relatoriosRoute = require('./rotas/relatorios');

app.use('/clientes', clientesRoute);
app.use('/pizzas', pizzasRoute);
app.use('/pedidos', pedidosRoute);
app.use('/relatorios', relatoriosRoute);


app.post('/upload', upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  res.json({ imagem: req.file.filename });
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});