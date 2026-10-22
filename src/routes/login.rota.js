import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import conexao from '../config/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(422).json({ erro: 'Informe login e senha' });
  }

  const { rows } = await conexao.query(
    'SELECT id_usuario, perfil, senha_hash FROM usuario WHERE login = $1',
    [login]
  );

  if (rows.length === 0) {
    return res.status(401).json({ erro: 'Login ou senha invalidos' });
  }

  const confere = await bcrypt.compare(senha, rows[0].senha_hash);
  if (!confere) {
    return res.status(401).json({ erro: 'Login ou senha invalidos' });
  }

  const token = jwt.sign(
    { id_usuario: rows[0].id_usuario, perfil: rows[0].perfil },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.status(200).json({ token });
});

export default router;