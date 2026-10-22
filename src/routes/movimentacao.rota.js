import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();

router.post('/movimentar_produto', async (req, res) => {
  const { id_produto, tipo, quantidade } = req.body;

  const { rows } = await conexao.query('SELECT quantidade FROM produto WHERE id_produto = $1', [id_produto]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Produto nao encontrado' });
  }

  const saldo = rows[0].quantidade;

  if (tipo === 'SAIDA' && quantidade > saldo) {
    return res.status(422).json({
      erro: `Saída não permitida: estoque insuficiente. Disponível: ${saldo}. Solicitado: ${quantidade}.`
    });
  }

  const novoSaldo = tipo === 'ENTRADA' ? saldo + quantidade : saldo - quantidade;

  await conexao.query(
    'INSERT INTO movimentacao (id_produto, id_usuario, tipo, quantidade) VALUES ($1, $2, $3, $4)',
    [id_produto, req.usuario.id_usuario, tipo, quantidade]
  );
  await conexao.query('UPDATE produto SET quantidade = $1 WHERE id_produto = $2', [novoSaldo, id_produto]);

  res.status(201).json({ mensagem: 'Movimentacao registrada', quantidade_atual: novoSaldo });
});

router.get('/listar_movimentacoes', async (req, res) => {
  const { nome, data_inicio, data_fim, id_usuario } = req.query;

  const { rows } = await conexao.query(
    `SELECT m.id_movimentacao, p.nome, m.tipo, m.quantidade, m.data_hora, u.nome AS responsavel
     FROM movimentacao m
     INNER JOIN produto p ON p.id_produto = m.id_produto
     INNER JOIN usuario u ON u.id_usuario = m.id_usuario
     WHERE ($1::text IS NULL OR p.nome ILIKE '%' || $1 || '%')
       AND ($2::date IS NULL OR m.data_hora::date >= $2::date)
       AND ($3::date IS NULL OR m.data_hora::date <= $3::date)
       AND ($4::int IS NULL OR m.id_usuario = $4::int)
     ORDER BY m.id_movimentacao DESC`,
    [nome || null, data_inicio || null, data_fim || null, id_usuario || null]
  );
  res.json(rows);
});

export default router;