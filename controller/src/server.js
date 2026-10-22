import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';
import conexao from "./config/db.js"
import bcrypt from 'bcryptjs';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors())
app.use(estoqueRoutes);
app.use(express.static('../../view/public'))

const porta = process.env.PORT || 3000;

//======================================================================================
app.post('/loginFuncionarios', async (req, res) =>{
  const {nome, email, senha} = req.body

  
  const user = conexao.query('SELECT * FROM usuarios WHERE senha = $1 RETURNING *', [senha])
  const isPasswordValid = await bcrypt.compare(senha, user.senha)

  if(!isPasswordValid){
    res.status(401).json({error: "Credenciais incorretas"})
  }
  res.json("Logado com sucesso")
})
//======================================================================================
//======================================================================================
app.post('/funcionarios', async (req, res) =>{
  const {nome, email, senha} = req.body
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(senha, salt)

  const NovoFUncionarios = await conexao.query('INSERT INTO funcionarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *', [nome, email, hashedPassword])
  res.json(NovoFUncionarios.rows[0])
})

//======================================================================================
//======================================================================================


app.get('/produtos', async (req, res) =>{
  const produtos = await conexao.query('SELECT * FROM produto')
  res.json(produtos.rows)
})


app.post('/produtos', async (req, res) => {
  const { nome, descricao, valor_unitario, quantidade } = req.body;
  const novoProduto = await conexao.query('INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES ($1, $2, $3, $4) RETURNING id_produto',[nome, descricao, valor_unitario, quantidade]);
  res.json(novoProduto.rows[0])
});


app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, valor_unitario, quantidade } = req.body;

  const attProduto = await conexao.query('UPDATE produto SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5', [nome, descricao, valor_unitario, quantidade, id])
    res.json(attProduto.rows[0])
});

app.delete('/produtos/:id_produto', async (req, res) => {
  const { id_produto } = req.params;

    const deletar_produto = await conexao.query('DELETE FROM produto WHERE id_produto = $1', [id_produto])
    res.json("produto excluido")
  
});

//======================================================================================
//======================================================================================
//======================================================================================
//======================================================================================
//======================================================================================

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});
