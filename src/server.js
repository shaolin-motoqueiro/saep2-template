
import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';
import loginRoutes from './routes/login.routes.js';

const app = express();

app.use(express.json());
app.use(express.static('src/public'));

app.use(loginRoutes);
app.use(estoqueRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
