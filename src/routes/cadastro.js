import express from 'express';
import conexao from '../config/db.js';

const router = express.Router();

router.post('/registerOperador', async (req, res) =>{
    try{
    const {nome, email, senha} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt)
    const register = await conexao.query("INSERT INTO operador (nome, email, senha) VALUE $1, $2, $3 RETURNING *", [nome, email, hashedPassword])
    return res.status(201).json(register.rows[0])
    }
    catch(err){
        return res.status(400).json("Erro ao criar usuario")
    }
})

router.post('/registerAdmin', async (req, res) =>{
    try{
    const {nome, email, senha} = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt)
    const register = await conexao.query("INSERT INTO admin (nome, email, senha) VALUE $1, $2, $3 RETURNING *", [nome, email, hashedPassword])
    return res.status(201).json(register.rows[0])
    }
    catch(err){
        return res.status(400).json("Erro ao criar usuario")
    }
})