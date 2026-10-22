import conexao from "../config/db.js";

export const produtoRepository = {
  create: async (nome, descricao, valorUnitario, quantidade) => {
    const { rows } = await conexao.query(
      `INSERT INTO produto (nome, descricao, valor_unitario, quantidade)
       VALUES ($1, $2, $3, $4)
       RETURNING id_produto`,
      [nome, descricao, valorUnitario, quantidade]
    );

    return rows[0].id_produto;
  },

  findById: async (id) => {
    const { rows } = await conexao.query(
      `SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro
       FROM produto
       WHERE id_produto = $1`,
      [id]
    );

    return rows[0] || null;
  },

  findAll: async () => {
    const { rows } = await conexao.query(
      `SELECT id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro
       FROM produto
       ORDER BY id_produto`
    );

    return rows;
  },

  update: async (id, nome, descricao, valorUnitario, quantidade) => {
    const { rowCount } = await conexao.query(
      `UPDATE produto
       SET nome = $1,
           descricao = $2,
           valor_unitario = $3,
           quantidade = $4
       WHERE id_produto = $5`,
      [nome, descricao, valorUnitario, quantidade, id]
    );

    return rowCount > 0;
  },

  delete: async (id) => {
    const { rowCount } = await conexao.query(
      `DELETE FROM produto
       WHERE id_produto = $1`,
      [id]
    );

    return rowCount > 0;
  },

  findMovimentacoesByProduto: async (id) => {
    const { rows } = await conexao.query(
      `SELECT id_movimentacao
       FROM movimentacao
       WHERE id_produto = $1`,
      [id]
    );

    return rows;
  },

  increaseQuantity: async (id, quantidade) => {
    const { rowCount } = await conexao.query(
      `UPDATE produto
       SET quantidade = quantidade + $1
       WHERE id_produto = $2`,
      [quantidade, id]
    );

    return rowCount > 0;
  },

  decreaseQuantity: async (id, quantidade) => {
    const { rowCount } = await conexao.query(
      `UPDATE produto
       SET quantidade = quantidade - $1
       WHERE id_produto = $2`,
      [quantidade, id]
    );

    return rowCount > 0;
  },

  findMovementById: async (id) => {
    const { rows } = await conexao.query(
      `SELECT m.id_movimentacao,
              m.id_produto,
              p.nome,
              m.tipo,
              m.quantidade
       FROM movimentacao m
       INNER JOIN produto p ON p.id_produto = m.id_produto
       WHERE m.id_movimentacao = $1`,
      [id]
    );

    return rows[0] || null;
  },

  findAllMovements: async () => {
    const { rows } = await conexao.query(
      `SELECT m.id_movimentacao,
              m.id_produto,
              p.nome,
              m.tipo,
              m.quantidade
       FROM movimentacao m
       INNER JOIN produto p ON p.id_produto = m.id_produto
       ORDER BY m.id_movimentacao DESC`
    );

    return rows;
  },
};
