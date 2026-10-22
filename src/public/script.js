
async function login() {
  try {
    const resposta = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      document.getElementById('mensagem').textContent =
        dados.erro || 'Erro no login';
      return;
    }

    sessionStorage.setItem('token', dados.token);
    sessionStorage.setItem('perfil', dados.perfil);

    location.href = dados.perfil === 'ADMIN'
      ? '/admin.html'
      : '/funcionario.html';
  } catch (erro) {
    console.error(erro);
    document.getElementById('mensagem').textContent =
      'Não foi possível conectar ao servidor';
  }
}

const token = sessionStorage.getItem('token');
const admin = sessionStorage.getItem('perfil') === 'ADMIN';

async function api(rota, metodo = 'GET', dados) {
  const resposta = await fetch(rota, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: dados ? JSON.stringify(dados) : undefined
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.erro || 'Erro na requisicao');
  }

  return resultado;
}

// LISTAR PRODUTOS
async function listar() {
  try {
    const produtos = await api('/listar_produtos');
    const lista = document.getElementById('produtos');

    lista.innerHTML = '';

    produtos.forEach(produto => {
      const item = document.createElement('p');

      item.textContent =
        `${produto.id_produto} - ${produto.nome} - R$ ${produto.valor_unitario} - Estoque: ${produto.quantidade}`;

      lista.appendChild(item);

      if (admin) {
        const editar = document.createElement('button');
        editar.textContent = 'Editar';
        editar.onclick = () => atualizar(produto);

        const excluir = document.createElement('button');
        excluir.textContent = 'Excluir';
        excluir.onclick = () => deletar(produto.id_produto);

        lista.append(editar, excluir);
      }
    });
  } catch (erro) {
    alert(erro.message);
  }
}

// CADASTRAR PRODUTO
async function cadastrar() {
  try {
    await api('/add_produto', 'POST', {
      nome: document.getElementById('nome').value,
      descricao: document.getElementById('descricao').value,
      valor: Number(document.getElementById('valor').value),
      quantidade: Number(document.getElementById('quantidade').value)
    });

    alert('Produto cadastrado!');
    await listar();
    await historico();
  } catch (erro) {
    alert(erro.message);
  }
}

// EDITAR PRODUTO
async function atualizar(produto) {
  const nome = prompt('Novo nome:', produto.nome);
  if (nome === null) return;

  const descricao = prompt('Nova descricao:', produto.descricao || '');
  if (descricao === null) return;

  const valor = prompt('Novo valor:', produto.valor_unitario);
  if (valor === null) return;

  try {
    await api('/atualizar_produto/' + produto.id_produto, 'PUT', {
      nome,
      descricao,
      valor: Number(valor)
    });

    alert('Produto atualizado!');
    await listar();
  } catch (erro) {
    alert(erro.message);
  }
}

// EXCLUIR PRODUTO
async function deletar(id) {
  if (!confirm('Excluir este produto e suas movimentacoes?')) return;

  try {
    await api('/deletar_produto', 'DELETE', {
      id_produto: id
    });

    alert('Produto excluido!');
    await listar();
    await historico();
  } catch (erro) {
    alert(erro.message);
  }
}

// MOVIMENTAR ESTOQUE
async function movimentar() {
  const id = Number(document.getElementById('idProduto').value);
  const quantidade = Number(document.getElementById('qtdMov').value);
  const campoTipo = document.getElementById('tipo');

  const dados = {
    id_produto: id,
    tipo: admin && campoTipo ? campoTipo.value : 'SAIDA',
    quantidade
  };

  try {
    const resultado = await api('/movimentar_produto', 'POST', dados);

    alert(resultado.mensagem || 'Movimentacao registrada!');
    await listar();

    if (admin) await historico();
  } catch (erro) {
    alert(erro.message);
  }
}

// HISTORICO DE MOVIMENTACOES
async function historico() {
  const lista = document.getElementById('movimentacoes');
  if (!lista) return;

  try {
    const movimentacoes = await api('/listar_movimentacoes');
    lista.innerHTML = '';

    movimentacoes.forEach(m => {
      const item = document.createElement('p');

      item.textContent =
        `${m.id_movimentacao} - ${m.nome} - ${m.tipo} - Quantidade: ${m.quantidade}`;

      lista.appendChild(item);
    });
  } catch (erro) {
    alert(erro.message);
  }
}

// SAIR DA CONTA
function sair() {
  sessionStorage.clear();
  location.href = '/';
}

// DISPONIBILIZAR FUNCOES PARA O HTML
window.login = login;
window.listar = listar;
window.cadastrar = cadastrar;
window.atualizar = atualizar;
window.deletar = deletar;
window.movimentar = movimentar;
window.historico = historico;
window.sair = sair;

// CARREGAR DADOS AO ABRIR OS PAINEIS
if (document.getElementById('produtos')) {
  if (!token) {
    location.href = '/';
  } else {
    listar();

    if (admin && document.getElementById('movimentacoes')) {
      historico();
    }
  }
}
