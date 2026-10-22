import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';
import { autenticar } from './middles/auth.js';
import loginRoutes from './routes/login.rota.js';
import produtosRoutes from './routes/produtos.rota.js';
import movimentacoesRoutes from './routes/movimentacao.rota.js';
import usuariosRoutes from './routes/usuario.rota.js';

const app = express();

app.use(express.json());
app.use(express.static('view')); 
app.use(loginRoutes);               
app.use(autenticar);                
app.use(produtosRoutes);
app.use(movimentacoesRoutes);
app.use(usuariosRoutes);
app.use(estoqueRoutes);

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
  console.log('Servidor rodando na porta ' + porta);
});