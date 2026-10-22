import db from '../config/db.js';

const COLS = 'id_produto, nome, descricao, valor_unitario, quantidade, data_cadastro';

export const criar = async (p) =>
  (await db.query(
    'INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES ($1,$2,$3,$4) RETURNING id_produto',
    [p.nome, p.descricao || null, p.valor, p.quantidade]
  )).rows[0].id_produto;

export async function listar({ nome, data, limite, offset }) {
  const filtros = [];
  const params = [];
  if (nome) { params.push(`%${nome}%`); filtros.push(`nome ILIKE $${params.length}`); }
  if (data) { params.push(data); filtros.push(`data_cadastro::date = $${params.length}`); }
  const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

  const { total } = (await db.query(`SELECT COUNT(*)::int AS total FROM produto ${where}`, params)).rows[0];
  params.push(limite, offset);
  const { rows } = await db.query(
    `SELECT ${COLS} FROM produto ${where} ORDER BY id_produto LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return { total, rows };
}

export const buscar = async (id) =>
  (await db.query(`SELECT ${COLS} FROM produto WHERE id_produto = $1`, [id])).rows[0];

export const atualizar = async (id, p) =>
  (await db.query(
    'UPDATE produto SET nome=$1, descricao=$2, valor_unitario=$3, quantidade=$4 WHERE id_produto=$5',
    [p.nome, p.descricao || null, p.valor, p.quantidade, id]
  )).rowCount;

export const temMovimentacoes = async (id) =>
  (await db.query('SELECT 1 FROM movimentacao WHERE id_produto = $1 LIMIT 1', [id])).rowCount > 0;

export const remover = async (id) =>
  (await db.query('DELETE FROM produto WHERE id_produto = $1', [id])).rowCount;