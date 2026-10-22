import express from 'express';
import bcrypt from 'bcryptjs';
import conexao from '../config/db.js';
import { somenteAdmin } from '../middles/auth.js';

const router = express.Router();

router.get('/listar_usuarios', somenteAdmin, async (req, res) => {
  const { rows } = await conexao.query('SELECT id_usuario, nome, login, perfil FROM usuario ORDER BY id_usuario');
  res.json(rows);
});

router.post('/add_usuario', somenteAdmin, async (req, res) => {
  const { nome, login, senha, perfil } = req.body;

  if (!senha || senha.length < 6) {
    return res.status(422).json({ erro: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await conexao.query(
    'INSERT INTO usuario (nome, login, senha_hash, perfil) VALUES ($1, $2, $3, $4)',
    [nome, login, senhaHash, perfil]
  );
  res.status(201).json({ mensagem: 'Usuario cadastrado' });
});

router.delete('/deletar_usuario', somenteAdmin, async (req, res) => {
  const { id_usuario } = req.body;

  const { rows } = await conexao.query('SELECT 1 FROM movimentacao WHERE id_usuario = $1', [id_usuario]);
  if (rows.length > 0) {
    return res.status(409).json({ erro: 'Usuario tem movimentacoes e nao pode ser removido' });
  }

  await conexao.query('DELETE FROM usuario WHERE id_usuario = $1', [id_usuario]);
  res.json({ mensagem: 'Usuario removido' });
});

export default router;