import express from 'express';
import { autorizar } from '../middlewares/auth.js';
import * as Produto from '../controllers/produtoController.js';
import * as Mov from '../controllers/movimentacaoController.js';

const router = express.Router();
const todos = autorizar('ADMIN', 'OPERADOR');

router.post('/add_produto', todos, Produto.adicionar);
router.get('/listar_produtos', todos, Produto.listar);
router.get('/listar_produto/:id', todos, Produto.consultar);
router.put('/atualizar_produto/:id', todos, Produto.atualizar);
router.delete('/deletar_produto', autorizar('ADMIN'), Produto.remover);

router.post('/movimentar_produto', todos, Mov.movimentar);
router.get('/listar_movimentacoes', todos, Mov.listar);

export default router;