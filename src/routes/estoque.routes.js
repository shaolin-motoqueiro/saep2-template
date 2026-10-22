
import { Router } from 'express';
import conexao from '../config/db.js';
import { autenticar, permitir } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem login
router.use(autenticar);

// CADASTRAR PRODUTO - SOMENTE ADMIN
router.post('/add_produto', permitir('ADMIN'), async (req, res) => {
  const { nome, descricao, valor, quantidade } = req.body;

  if (!nome || !String(nome).trim() ||
      valor === undefined || valor === null || valor === '' ||
      !Number.isFinite(Number(valor)) || Number(valor) < 0 ||
      quantidade === undefined || quantidade === null || quantidade === '' ||
      !Number.isInteger(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(422).json({ erro: 'Dados invalidos' });
  }

  let cliente;

  try {
    cliente = await conexao.connect();
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      `INSERT INTO produto (nome, descricao, valor_unitario, quantidade)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nome, descricao || null, Number(valor), Number(quantidade)]
    );

    const produto = resultado.rows[0];

    if (Number(quantidade) > 0) {
      await cliente.query(
        `INSERT INTO movimentacao (id_produto, tipo, quantidade)
         VALUES ($1, 'ENTRADA', $2)`,
        [produto.id_produto, Number(quantidade)]
      );
    }

    await cliente.query('COMMIT');

    res.status(201).json({
      mensagem: 'Produto cadastrado',
      produto
    });

  } catch (erro) {
    if (cliente) await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  } finally {
    if (cliente) cliente.release();
  }
});


router.get('/listar_produtos', async (req, res) => {
  try {
    const resultado = await conexao.query(
      'SELECT * FROM produto ORDER BY id_produto'
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
});


router.get('/listar_produto/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(422).json({ erro: 'ID invalido' });
  }

  try {
    const resultado = await conexao.query(
      'SELECT * FROM produto WHERE id_produto = $1',
      [id]
    );

    if (!resultado.rows.length) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao consultar produto' });
  }
});


router.put('/atualizar_produto/:id', permitir('ADMIN'), async (req, res) => {
  const id = Number(req.params.id);
  const { nome, descricao, valor } = req.body;

  if (!Number.isInteger(id) || id <= 0 ||
      !nome || !String(nome).trim() ||
      valor === undefined || valor === null || valor === '' ||
      !Number.isFinite(Number(valor)) || Number(valor) < 0) {
    return res.status(422).json({ erro: 'Dados invalidos' });
  }

  try {
    const resultado = await conexao.query(
      `UPDATE produto
       SET nome = $1, descricao = $2, valor_unitario = $3
       WHERE id_produto = $4
       RETURNING *`,
      [nome, descricao || null, Number(valor), id]
    );

    if (!resultado.rows.length) {
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    res.json({
      mensagem: 'Produto atualizado',
      produto: resultado.rows[0]
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
});


router.delete('/deletar_produto', permitir('ADMIN'), async (req, res) => {
  const id = Number(req.body.id_produto);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(422).json({ erro: 'ID invalido' });
  }

  let cliente;

  try {
    cliente = await conexao.connect();
    await cliente.query('BEGIN');


    const produto = await cliente.query(
      'SELECT id_produto FROM produto WHERE id_produto = $1 FOR UPDATE',
      [id]
    );

    if (!produto.rows.length) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    await cliente.query(
      'DELETE FROM movimentacao WHERE id_produto = $1',
      [id]
    );

    await cliente.query(
      'DELETE FROM produto WHERE id_produto = $1',
      [id]
    );

    await cliente.query('COMMIT');

    res.json({ mensagem: 'Produto excluido com sucesso' });

  } catch (erro) {
    if (cliente) await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao excluir produto' });
  } finally {
    if (cliente) cliente.release();
  }
});


router.post('/movimentar_produto', async (req, res) => {
  const { id_produto, tipo, quantidade } = req.body;
  const id = Number(id_produto);
  const qtd = Number(quantidade);


  if (req.usuario.perfil === 'FUNCIONARIO' && tipo !== 'SAIDA') {
    return res.status(403).json({
      erro: 'Funcionario so pode registrar saidas'
    });
  }

  if (!Number.isInteger(id) || id <= 0 ||
      !['ENTRADA', 'SAIDA'].includes(tipo) ||
      quantidade === undefined || quantidade === null || quantidade === '' ||
      !Number.isInteger(qtd) || qtd <= 0) {
    return res.status(422).json({ erro: 'Dados invalidos' });
  }

  let cliente;

  try {
    cliente = await conexao.connect();
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      'SELECT * FROM produto WHERE id_produto = $1 FOR UPDATE',
      [id]
    );

    if (!resultado.rows.length) {
      await cliente.query('ROLLBACK');
      return res.status(404).json({ erro: 'Produto nao encontrado' });
    }

    const produto = resultado.rows[0];

    if (tipo === 'SAIDA' && produto.quantidade < qtd) {
      await cliente.query('ROLLBACK');
      return res.status(409).json({ erro: 'Estoque insuficiente' });
    }

    const novaQuantidade = tipo === 'ENTRADA'
      ? produto.quantidade + qtd
      : produto.quantidade - qtd;

    await cliente.query(
      'UPDATE produto SET quantidade = $1 WHERE id_produto = $2',
      [novaQuantidade, id]
    );

    await cliente.query(
      `INSERT INTO movimentacao (id_produto, tipo, quantidade)
       VALUES ($1, $2, $3)`,
      [id, tipo, qtd]
    );

    await cliente.query('COMMIT');

    res.status(201).json({
      mensagem: 'Movimentacao registrada',
      estoque_atual: novaQuantidade
    });

  } catch (erro) {
    if (cliente) await cliente.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao movimentar estoque' });
  } finally {
    if (cliente) cliente.release();
  }
});


router.get('/listar_movimentacoes', permitir('ADMIN'), async (req, res) => {
  try {
    const resultado = await conexao.query(
      `SELECT m.id_movimentacao, m.id_produto,
              p.nome, m.tipo, m.quantidade
       FROM movimentacao m
       JOIN produto p ON p.id_produto = m.id_produto
       ORDER BY m.id_movimentacao DESC`
    );

    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao listar movimentacoes' });
  }
});

export default router;
