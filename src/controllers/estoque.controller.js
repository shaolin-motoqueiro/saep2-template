import { add_produto } from "../repository/estoque.repository.js"
import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();



router.post('/add_produto', async (req, res) => {
  

  if (!nome || nome.trim() === '') {
    return res.status(422).json({ erro: 'O campo nome e obrigatorio' });
  }
  if (valor === undefined || valor === null || isNaN(Number(valor)) || Number(valor) < 0) {
    return res.status(422).json({ erro: 'O campo valor deve ser um numero maior ou igual a zero' });
  }
  if (quantidade === undefined || quantidade === null || isNaN(Number(quantidade)) || Number(quantidade) < 0) {
    return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior ou igual a zero' });
  }

  try {
    
    add_produto()

    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso',
      id_produto: rows[0].id_produto
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
});

add_produto()
