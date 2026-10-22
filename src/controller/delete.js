import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();

router.delete('/deletar_produto', async (req, res) => {
  const { id_produto } = req.body;

  if (id_produto === undefined || id_produto === null || isNaN(Number(id_produto))) {
    return res.status(422).json({ erro: 'O campo id_produto e obrigatorio' });
  }

  try {
    const { rows: movimentacoes } = await conexao.query(
      'SELECT id_movimentacao FROM movimentacao WHERE id_produto = $1',
      [Number(id_produto)]
    );

    if (movimentacoes.length > 0) {
      return res.status(409).json({ erro: 'O produto possui movimentacoes e nao pode ser removido' });
    }

    const resultado = await conexao.query(
      'DELETE FROM produto WHERE id_produto = $1',
      [Number(id_produto)]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    return res.status(200).json({ mensagem: 'Produto removido com sucesso' });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao remover produto' });
  }
});

// ---------------------------------------------------------------------------
// MOVIMENTACOES
// ---------------------------------------------------------------------------

export default router;