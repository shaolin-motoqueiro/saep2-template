// ======================= PRODUTOS ADMINISTRADOR ==================================

const btnListaradm = document.getElementById('get-listar')
const btnCadastraradm = document.getElementById('post-listar')
const btnAtualizaradm = document.getElementById('get-atualizar')
const btnDeletaradm = document.getElementById('delete')

btnListaradm.addEventListener('click', async () => {
    const response = await fetch ('http://localhost:3000/produtos')
document.getElementById('listar-admin').textContent = (response)
})

btnCadastraradm.addEventListener('click', async () => {
    const response = await fetch ('http://localhost:3000/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify ({
    nome: document.getElementById('nome-cadastrar').value,
    descricao: document.getElementById('descricao-cadastrar').value,
    valor: document.getElementById('valor-cadastrar').value,
    quantidade: document.getElementById('quantidade-cadastrar').value,
   }),
})
    const data = await response.json();
    console.log(data)
})


