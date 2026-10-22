import * as Mov from '../models/movimentacaoModel.js';

export async function movimentar(req, res) {
  const { id_produto, tipo } = req.body;
  const quantidade = Number(req.body.quantidade);

  if (id_produto == null || isNaN(Number(id_produto))) return res.status(422).json({ erro: 'O campo id_produto e obrigatorio' });
  if (!['ENTRADA', 'SAIDA'].includes(tipo)) return res.status(422).json({ erro: 'tipo deve ser ENTRADA ou SAIDA' });
  if (isNaN(quantidade) || quantidade <= 0) return res.status(422).json({ erro: 'O campo quantidade deve ser um numero maior que zero' });

  try {
    const r = await Mov.registrar({ id_produto: Number(id_produto), tipo, quantidade, id_usuario: req.usuario.id });
    if (r.erro === 'NAO_ENCONTRADO') return res.status(404).json({ erro: 'Produto nao encontrado' });
    if (r.erro === 'INSUFICIENTE')
      return res.status(400).json({ erro: `Saída não permitida: estoque insuficiente. Disponível: ${r.saldo}. Solicitado: ${quantidade}.` });

    return res.status(201).json({
      mensagem: `${tipo === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso`,
      quantidade_atual: r.saldo
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao movimentar produto' });
  }
}

export async function listar(req, res) {
  try {
    return res.status(200).json(await Mov.listar());
  } catch (e) {
    console.log(e);
    return res.status(500).json({ erro: 'Erro ao listar movimentacoes' });
  }
}