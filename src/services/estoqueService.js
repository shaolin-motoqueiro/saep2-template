import {
  produtoRepository,
  movementRepository,
} from "../repositories/estoqueRepository.js";

import {
  validateCreateProduct,
  validateUpdateProduct,
  validateRegisterMovement,
} from "../validators/estoqueValidator.js";

export const productService = {
  create: async (input) => {
    const { valid, errors } = validateCreateProduct(input);

    if (!valid) {
      return {
        success: false,
        status: 422,
        errors,
      };
    }

    const { nome, descricao = null, valor, quantidade } = input;

    const produtos = await produtoRepository.findAll();

    const produtoJaExiste = produtos.some(
      (p) => p.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (produtoJaExiste) {
      return {
        success: false,
        status: 409,
        errors: [
          {
            campo: "nome",
            mensagem: "Já existe um produto com esse nome cadastrado.",
          },
        ],
      };
    }

    const id = await produtoRepository.create(
      nome.trim(),
      descricao,
      valor,
      quantidade
    );

    return {
      success: true,
      status: 201,
      data: { id_produto: id },
      mensagem: "Produto cadastrado com sucesso",
    };
  },

  findAll: async () => {
    const produtos = await produtoRepository.findAll();

    return {
      success: true,
      status: 200,
      data: produtos,
    };
  },

  findById: async (id) => {
    const produto = await produtoRepository.findById(id);

    if (!produto) {
      return {
        success: false,
        status: 404,
        errors: [
          {
            campo: "id_produto",
            mensagem: "Produto não encontrado.",
          },
        ],
      };
    }

    return {
      success: true,
      status: 200,
      data: produto,
    };
  },

  update: async (id, input) => {
    const { valid, errors } = validateUpdateProduct(input);

    if (!valid) {
      return {
        success: false,
        status: 422,
        errors,
      };
    }

    const produto = await produtoRepository.findById(id);

    if (!produto) {
      return {
        success: false,
        status: 404,
        errors: [
          {
            campo: "id_produto",
            mensagem: "Produto não encontrado.",
          },
        ],
      };
    }

    const { nome, descricao = null, valor, quantidade } = input;

    const produtos = await produtoRepository.findAll();

    const produtoComMesmoNome = produtos.find(
      (p) =>
        p.id_produto !== id &&
        p.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (produtoComMesmoNome) {
      return {
        success: false,
        status: 409,
        errors: [
          {
            campo: "nome",
            mensagem: "Já existe outro produto com esse nome cadastrado.",
          },
        ],
      };
    }

    const updated = await produtoRepository.update(
      id,
      nome.trim(),
      descricao,
      valor,
      quantidade
    );

    if (!updated) {
      return {
        success: false,
        status: 500,
        errors: [
          {
            campo: "operacao",
            mensagem: "Falha ao atualizar produto.",
          },
        ],
      };
    }

    return {
      success: true,
      status: 200,
      mensagem: "Produto atualizado com sucesso",
    };
  },

  delete: async (id) => {
    const produto = await produtoRepository.findById(id);

    if (!produto) {
      return {
        success: false,
        status: 404,
        errors: [
          {
            campo: "id_produto",
            mensagem: "Produto não encontrado.",
          },
        ],
      };
    }

    const movimentacoes = await produtoRepository.findMovimentacoesByProduto(id);

    if (movimentacoes.length > 0) {
      return {
        success: false,
        status: 409,
        errors: [
          {
            campo: "id_produto",
            mensagem: "O produto possui movimentações e não pode ser removido.",
          },
        ],
      };
    }

    const deleted = await produtoRepository.delete(id);

    if (!deleted) {
      return {
        success: false,
        status: 500,
        errors: [
          {
            campo: "operacao",
            mensagem: "Falha ao remover produto.",
          },
        ],
      };
    }

    return {
      success: true,
      status: 200,
      mensagem: "Produto removido com sucesso",
    };
  },
};

export const movementService = {
  register: async (input) => {
    const { valid, errors } = validateRegisterMovement(input);

    if (!valid) {
      return {
        success: false,
        status: 422,
        errors,
      };
    }

    const { id_produto, tipo, quantidade } = input;

    const produto = await produtoRepository.findById(id_produto);

    if (!produto) {
      return {
        success: false,
        status: 404,
        errors: [
          {
            campo: "id_produto",
            mensagem: "Produto não encontrado.",
          },
        ],
      };
    }

    const tipo = quantidade > 0 ? "ENTRADA" : "SAIDA";

    if (tipo === "ENTRADA") {
      const novaQuantidade = produto.quantidade + quantidade;

      const registrou = await produtoRepository.increaseQuantity(
        id_produto,
        quantidade
      );

      if (!registrou) {
        return {
          success: false,
          status: 500,
          errors: [
            {
              campo: "operacao",
              mensagem: "Falha ao registrar movimentação de entrada.",
            },
          ],
        };
      }

      return {
        success: true,
        status: 201,
        data: {
          mensagem: "Entrada registrada com sucesso",
          quantidade_atual: novaQuantidade,
        },
      };
    }

    if (tipo === "SAIDA") {
      if (quantidade > produto.quantidade) {
        return {
          success: false,
          status: 409,
          errors: [
            {
              campo: "quantidade",
              mensagem: "Quantidade insuficiente no estoque para realizar saída.",
            },
          ],
        };
      }

      const registrou = await produtoRepository.decreaseQuantity(
        id_produto,
        quantidade
      );

      if (!registrou) {
        return {
          success: false,
          status: 500,
          errors: [
            {
              campo: "operacao",
              mensagem: "Falha ao registrar movimentação de saída.",
            },
          ],
        };
      }

      return {
        success: true,
        status: 201,
        data: {
          mensagem: "Saída registrada com sucesso",
          quantidade_atual: produto.quantidade - quantidade,
        },
      };
    }

    return {
      success: false,
      status: 422,
      errors: [
        {
          campo: "tipo",
          mensagem: "Tipo de movimentação inválido.",
        },
      ],
    };
  },

  findAll: async () => {
    const movimentacoes = await produtoRepository.findAllMovements();

    return {
      success: true,
      status: 200,
      data: movimentacoes,
    };
  },
};
