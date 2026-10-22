import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();

router.get('/listar_produtos', async (req, res) => {
  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro FROM produto'
    );

    return res.status(200).json(produtos);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});

router.get('/listar_produto/:id', async (req, res) => {
  const { id } = req.params;
 
  if (isNaN(Number(id))) {
    return res.status(422).json({ erro: 'O id informado e invalido' });
  }

  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro FROM produto WHERE id_produto = $1',
      [Number(id)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    return res.status(200).json(produtos[0]);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao consultar produto' });
  }
});

// ---------------------------------------------------------------------------
// MOVIMENTACOES
// ---------------------------------------------------------------------------

router.get('/listar_movimentacoes', async (req, res) => {
  try {
    const { rows: movimentacoes } = await conexao.query(
      'SELECT m.id_movimentacao, m.id_produto, p.nome, m.tipo, m.quantidade ' +
      'FROM movimentacao m ' +
      'INNER JOIN produto p ON p.id_produto = m.id_produto ' +
      'ORDER BY m.id_movimentacao DESC'
    );

    return res.status(200).json(movimentacoes);
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao listar movimentacoes' });
  }
});

export default router;

