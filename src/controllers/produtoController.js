import * as Produto from '../models/produtoModel.js';

const invalido = (v) => v === undefined || v === null || isNaN(Number(v)) || Number(v) < 0;

function validar({ nome, valor, quantidade }) {
  if (!nome || nome.trim() === '') return 'O campo nome e obrigatorio';
  if (invalido(valor)) return 'O campo valor deve ser um numero maior ou igual a zero';
  if (invalido(quantidade)) return 'O campo quantidade deve ser um numero maior ou igual a zero';
}

const dados = (b) => ({ nome: b.nome, descricao: b.descricao, valor: Number(b.valor), quantidade: Number(b.quantidade) });

export async function adicionar(req, res) {
  const erro = validar(req.body);
  if (erro) return res.status(422).json({ erro });
  try {
    const id = await Produto.criar(dados(req.body));
    return res.status(201).json({ mensagem: 'Produto cadastrado com sucesso', id_produto: id });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao cadastrar produto' });
  }
}

export async function listar(req, res) {
  const pagina = Math.max(Number(req.query.page) || 1, 1);
  const limite = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  try {
    const { total, rows } = await Produto.listar({
      nome: req.query.nome,
      data: req.query.data,
      limite,
      offset: (pagina - 1) * limite
    });
    return res.status(200).json({ pagina, limite, total, produtos: rows });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao listar produtos' });
  }
}

export async function consultar(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(422).json({ erro: 'O id informado e invalido' });
  try {
    const p = await Produto.buscar(id);
    return p ? res.status(200).json(p) : res.status(404).json({ erro: 'Produto nao encontrado' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao consultar produto' });
  }
}

export async function atualizar(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(422).json({ erro: 'O id informado e invalido' });
  const erro = validar(req.body);
  if (erro) return res.status(422).json({ erro });
  try {
    const n = await Produto.atualizar(id, dados(req.body));
    return n ? res.status(200).json({ mensagem: 'Produto atualizado com sucesso' })
             : res.status(404).json({ erro: 'Produto nao encontrado' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
}

export async function remover(req, res) {
  const id = Number(req.body.id_produto);
  if (req.body.id_produto == null || isNaN(id)) return res.status(422).json({ erro: 'O campo id_produto e obrigatorio' });
  try {
    if (await Produto.temMovimentacoes(id))
      return res.status(409).json({ erro: 'O produto possui movimentacoes e nao pode ser removido' });
    const n = await Produto.remover(id);
    return n ? res.status(200).json({ mensagem: 'Produto removido com sucesso' })
             : res.status(404).json({ erro: 'Produto nao encontrado' });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao remover produto' });
  }
}