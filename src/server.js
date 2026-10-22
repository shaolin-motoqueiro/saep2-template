import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import estoqueRoutes from './routes/estoque.routes.js';
import { autenticar } from './middlewares/auth.js';

const app = express();
app.use(express.json());

app.use(authRoutes);
app.use(autenticar, estoqueRoutes);

const porta = process.env.PORT || 3000;
app.listen(porta, () => console.log('Servidor rodando na porta ' + porta));