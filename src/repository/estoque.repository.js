import conexao from '../config/db.js';


export async function add_produto(req, res) {
    const { nome, descricao, valor, quantidade } = req.body;
    const { rows } = await conexao.query(
      'INSERT INTO produto (nome, descricao, valor_unitario, quantidade) VALUES ($1, $2, $3, $4) RETURNING id_produto',
      [nome, descricao || null, Number(valor), Number(quantidade)]
    );

    console.log("vamo")
}

export default add_produto;