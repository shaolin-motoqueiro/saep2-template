import db from '../config/db.js';

export const buscarPorEmail = async (email) =>
  (await db.query('SELECT * FROM usuario WHERE email = $1', [email])).rows[0];

export const criar = async ({ nome, email, senha, perfil }) =>
  (await db.query(
    'INSERT INTO usuario (nome, email, senha, perfil) VALUES ($1,$2,$3,$4) RETURNING id_usuario',
    [nome, email, senha, perfil]
  )).rows[0].id_usuario;