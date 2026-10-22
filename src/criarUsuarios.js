
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import conexao from './config/db.js';

const usuarios = [
  {
    nome: 'Administrador',
    email: 'admin@empresa.com',
    senha: 'Admin12345',
    perfil: 'ADMIN'
  },
  {
    nome: 'Funcionario',
    email: 'funcionario@empresa.com',
    senha: 'Func12345',
    perfil: 'FUNCIONARIO'
  }
];

try {
  for (const usuario of usuarios) {
    const senhaHash = await bcrypt.hash(usuario.senha, 10);

    await conexao.query(
      `INSERT INTO usuario (nome, email, senha, perfil)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [usuario.nome, usuario.email, senhaHash, usuario.perfil]
    );

    console.log('Conta verificada:', usuario.email);
  }
} catch (erro) {
  console.error('Erro ao criar usuarios:', erro.message);
} finally {
  await conexao.end();
}
