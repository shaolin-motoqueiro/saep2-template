import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuarioModel.js';

export async function cadastrar(req, res) {
  const { nome, email, senha, perfil = 'OPERADOR' } = req.body;
  if (!nome || !email || !senha) return res.status(422).json({ erro: 'nome, email e senha sao obrigatorios' });
  if (!['ADMIN', 'OPERADOR'].includes(perfil)) return res.status(422).json({ erro: 'perfil invalido' });

  try {
    if (await Usuario.buscarPorEmail(email)) return res.status(409).json({ erro: 'Email ja cadastrado' });
    const id = await Usuario.criar({ nome, email, senha: await bcrypt.hash(senha, 10), perfil });
    return res.status(201).json({ mensagem: 'Usuario cadastrado com sucesso', id_usuario: id });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar usuario' });
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(422).json({ erro: 'email e senha sao obrigatorios' });

  try {
    const u = await Usuario.buscarPorEmail(email);
    if (!u || !(await bcrypt.compare(senha, u.senha))) return res.status(401).json({ erro: 'Credenciais invalidas' });

    const token = jwt.sign({ id: u.id_usuario, nome: u.nome, perfil: u.perfil }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '2h'
    });
    return res.status(200).json({ token, perfil: u.perfil });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao autenticar' });
  }
}