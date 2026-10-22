import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();

router.put('/atualizar_produto/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, valor, quantidade } = req.body;

  if (isNaN(Number(id))) {
    return res.status(422).json({ erro: 'O id informado e invalido' });
  }
  if (!nome || nome.trim() === '') {
    return res.status(422).json({ erro: 'O campo nome e obrigatorio' });
  }
  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    return res.status(422).json({ erro: 'O campo valor deve ser um numero maior ou igual a zero' });
  }
  if (quantidade === undefined || quantidade === null || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior ou igual a zero' });
  }

  try {
    const { rows: produtos } = await conexao.query(
      'SELECT id_produto FROM produto WHERE id_produto = $1',
      [Number(id)]
    );

    if (produtos.length === 0) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    await conexao.query(
      'UPDATE produto SET nome = $1, descricao = $2, valor_unitario = $3, quantidade = $4 WHERE id_produto = $5',
      [nome, descricao || null, Number(valor), Number(quantidade), Number(id)]
    );

    return res.status(200).json({ mensagem: 'Produto atualizado com sucesso' });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});

// ---------------------------------------------------------------------------
// MOVIMENTACOES
// ---------------------------------------------------------------------------

export default router;