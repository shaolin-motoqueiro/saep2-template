
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import conexao from '../config/db.js';
import { autenticar, permitir } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const resultado = await conexao.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );

    const usuario = resultado.rows[0];

    if (!usuario || !(await bcrypt.compare(senha || '', usuario.senha))) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      nome: usuario.nome,
      perfil: usuario.perfil
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro no login' });
  }
});

router.post('/usuarios', autenticar, permitir('ADMIN'), async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome?.trim() || !email?.trim() ||
        typeof senha !== 'string' || senha.length < 8 ||
        !['ADMIN', 'FUNCIONARIO'].includes(perfil)) {
      return res.status(422).json({ erro: 'Dados invalidos' });
    }

    const hash = await bcrypt.hash(senha, 10);

    const resultado = await conexao.query(
      `INSERT INTO usuario (nome, email, senha, perfil)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nome, email, perfil`,
      [nome.trim(), email.trim().toLowerCase(), hash, perfil]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Email ja cadastrado' });
    }

    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar usuario' });
  }
});

export default router;
