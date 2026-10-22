import 'dotenv/config';
import express from 'express';
import cors from "cors"
import pool from "./config/db.js"
import estoqueRoutes from './routes/estoque.routes.js';

const app = express();

app.use(express.json());
app.use(cors()); 
app.use(estoqueRoutes);

const porta = process.env.PORT || 3000;

// =============================== PRODUTOS ADMINISTRADOR ======================================
app.get('/produtos', async (req, res) => {
  const produto = await pool.query('SELECT * FROM produto')
  res.json(produto.rows)
})

app.post('/produtos', async (req, res) => {
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const novoProduto = await pool.query('INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES($1, $2, $3, $4) RETURNING *', [nome, descricao, valor_unitario, quantidade])
  res.json(novoProduto.rows[0])
})

app.put('/produtos/:id', async (req, res) => {
  const {id} = req.params
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const atualizarProduto = await pool.query('UPDATE produto SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5 RETURNING *', [nome, descricao, valor_unitario, quantidade, id])
  res.json(atualizarProduto.rows[0])
})

app.delete('/produtos/:id', async (req, res) => {
  const {id} = req.params
  const deletarProduto = await pool.query('DELETE FROM produto WHERE id_produto = $1 RETURNING *', [id])
  res.json(deletarProduto.rows[0])
})

// =============================== PRODUTOS FUNCIONÁRIO ======================================

app.get('/produto', async (req, res) => {
  const produtos = await pool.query('SELECT * FROM produto')
  res.json(produtos.rows)
})

app.post('/produto', async (req, res) => {
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const novoProdutos = await pool.query('INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES($1, $2, $3, $4) RETURNING *', [nome, descricao, valor_unitario, quantidade])
  res.json(novoProdutos.rows[0])
})

app.put('/produto/:id', async (req, res) => {
  const {id} = req.params
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const atualizarProdutos = await pool.query('UPDATE produto SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5 RETURNING *', [nome, descricao, valor_unitario, quantidade, id])
  res.json(atualizarProdutos.rows[0])
})


// =============================== LOGIN FUNCIONÁRIO ======================================

app.post('/login', async (req, res) => {
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const novoFuncionario = await pool.query('INSERT INTO funcionario (nome, descricao, valor_unitario, quantidade) VALUES($1, $2, $3, $4) RETURNING *', [nome, descricao, valor_unitario, quantidade])
  res.json(novoFuncionario.rows[0])
})

app.put('/login/:id', async (req, res) => {
  const {id} = req.params
  const {nome, descricao, valor_unitario, quantidade} = req.body
  const atualizarFuncionario = await pool.query('UPDATE funcionario SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5 RETURNING *', [nome, descricao, valor_unitario, quantidade, id])
  res.json(atualizarFuncionario.rows[0])
})

app.delete('/login/:id', async (req, res) => {
  const {id} = req.params
  const deletarFuncionario = await pool.query('DELETE FROM funcionario WHERE id_produto = $1 RETURNING *', [id])
  res.json(deletarFuncionario.rows[0])
})

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});
