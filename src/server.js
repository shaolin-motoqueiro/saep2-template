import 'dotenv/config';
import express from 'express';
import estoqueRoutes from './routes/estoque.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(estoqueRoutes);

app.use((req, res, next) => {
  const error = new Error('Rota não encontrada.');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
});
