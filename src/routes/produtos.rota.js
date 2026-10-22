import express from 'express';
import conexao from '../config/db.js';
import { somenteAdmin } from '../middles/auth.js';

const router = express.Router();

router.get('/listar_produtos', async (req, res) => {
  const { rows } = await conexao.query(
    'SELECT * FROM produto WHERE ($1::text IS NULL OR categoria = $1) ORDER BY id_produto',
    [req.query.categoria || null]
  );
  res.json(rows);
});

router.get('/listar_produto/:id', async (req, res) => {
  const { rows } = await conexao.query('SELECT * FROM produto WHERE id_produto = $1', [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Produto nao encontrado' });
  }
  res.json(rows[0]);
});

router.post('/add_produto', async (req, res) => {
  const { nome, descricao, categoria, valor, quantidade } = req.body;

  const { rows } = await conexao.query(
    'INSERT INTO produto (nome, descricao, categoria, valor_unitario, quantidade) VALUES ($1, $2, $3, $4, $5) RETURNING id_produto',
    [nome, descricao || null, categoria || 'GERAL', valor, quantidade]
  );
  const id = rows[0].id_produto;

  if (quantidade > 0) {
    await conexao.query(
      'INSERT INTO movimentacao (id_produto, id_usuario, tipo, quantidade) VALUES ($1, $2, $3, $4)',
      [id, req.usuario.id_usuario, 'ENTRADA', quantidade]
    );
  }

  res.status(201).json({ mensagem: 'Produto cadastrado', id_produto: id });
});

router.put('/atualizar_produto/:id', async (req, res) => {
  const { nome, descricao, categoria, valor } = req.body;

  await conexao.query(
    'UPDATE produto SET nome = $1, descricao = $2, categoria = $3, valor_unitario = $4 WHERE id_produto = $5',
    [nome, descricao || null, categoria || 'GERAL', valor, req.params.id]
  );
  res.json({ mensagem: 'Produto atualizado' });
});

router.delete('/deletar_produto', somenteAdmin, async (req, res) => {
  const { id_produto } = req.body;

  const { rows } = await conexao.query('SELECT 1 FROM movimentacao WHERE id_produto = $1', [id_produto]);
  if (rows.length > 0) {
    return res.status(409).json({ erro: 'Produto tem movimentacoes e nao pode ser removido' });
  }

  await conexao.query('DELETE FROM produto WHERE id_produto = $1', [id_produto]);
  res.json({ mensagem: 'Produto removido' });
});

export default router;