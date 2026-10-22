const getErrorMessage = (field, message) => ({
  campo: field,
  mensagem: message,
});

export const validateCreateProduct = (body) => {
  const errors = [];

  if (!body.nome || typeof body.nome !== "string" || body.nome.trim() === "") {
    errors.push(getErrorMessage("nome", "O campo nome é obrigatório e deve ser um texto."));
  }

  if (body.valor === undefined || body.valor === null || typeof body.valor !== "number" || Number.isNaN(body.valor) || body.valor < 0) {
    errors.push(getErrorMessage("valor", "O campo valor deve ser um número maior ou igual a zero."));
  }

  if (body.quantidade === undefined || body.quantidade === null || typeof body.quantidade !== "number" || Number.isNaN(body.quantidade) || body.quantidade < 0) {
    errors.push(getErrorMessage("quantidade", "O campo quantidade deve ser um número maior ou igual a zero."));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUpdateProduct = (body) => {
  const errors = [];

  if (!body.nome || typeof body.nome !== "string" || body.nome.trim() === "") {
    errors.push(getErrorMessage("nome", "O campo nome é obrigatório e deve ser um texto."));
  }

  if (body.valor === undefined || body.valor === null || typeof body.valor !== "number" || Number.isNaN(body.valor) || body.valor < 0) {
    errors.push(getErrorMessage("valor", "O campo valor deve ser um número maior ou igual a zero."));
  }

  if (body.quantidade === undefined || body.quantidade === null || typeof body.quantidade !== "number" || Number.isNaN(body.quantidade) || body.quantidade < 0) {
    errors.push(getErrorMessage("quantidade", "O campo quantidade deve ser um número maior ou igual a zero."));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateRegisterMovement = (body) => {
  const errors = [];

  if (!body.id_produto || typeof body.id_produto !== "number" || Number.isNaN(body.id_produto)) {
    errors.push(getErrorMessage("id_produto", "O campo id_produto é obrigatório e deve ser um número."));
  }

  if (!body.tipo || typeof body.tipo !== "string") {
    errors.push(getErrorMessage("tipo", "O campo tipo é obrigatório."));
  } else if (!["ENTRADA", "SAIDA"].includes(body.tipo.toUpperCase())) {
    errors.push(getErrorMessage("tipo", "O tipo deve ser ENTRADA ou SAIDA."));
  }

  if (body.quantidade === undefined || body.quantidade === null || typeof body.quantidade !== "number" || Number.isNaN(body.quantidade) || body.quantidade <= 0) {
    errors.push(getErrorMessage("quantidade", "O campo quantidade deve ser um número maior que zero."));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
