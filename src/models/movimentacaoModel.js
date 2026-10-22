import db from '../config/db.js';

export async function registrar({ id_produto, tipo, quantidade, id_usuario }) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT quantidade FROM produto WHERE id_produto = $1 FOR UPDATE', [id_produto]
    );
    if (rows.length === 0) { await client.query('ROLLBACK'); return { erro: 'NAO_ENCONTRADO' }; }

    const saldo = rows[0].quantidade;
    if (tipo === 'SAIDA' && quantidade > saldo) {
      await client.query('ROLLBACK');
      return { erro: 'INSUFICIENTE', saldo };
    }

    const novoSaldo = tipo === 'ENTRADA' ? saldo + quantidade : saldo - quantidade;
    await client.query(
      'INSERT INTO movimentacao (id_produto, tipo, quantidade, id_usuario) VALUES ($1,$2,$3,$4)',
      [id_produto, tipo, quantidade, id_usuario]
    );
    await client.query('UPDATE produto SET quantidade = $1 WHERE id_produto = $2', [novoSaldo, id_produto]);
    await client.query('COMMIT');
    return { saldo: novoSaldo };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export const listar = async () =>
  (await db.query(
    `SELECT m.id_movimentacao, m.id_produto, p.nome, m.tipo, m.quantidade, m.data_hora, u.nome AS usuario
     FROM movimentacao m
     INNER JOIN produto p ON p.id_produto = m.id_produto
     LEFT JOIN usuario u ON u.id_usuario = m.id_usuario
     ORDER BY m.id_movimentacao DESC`
  )).rows;