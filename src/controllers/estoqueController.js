export const productController = {
  create: async (req, res) => {
    const result = await productService.create(req.body);

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json({
      mensagem: result.mensagem,
      id_produto: result.data.id_produto,
    });
  },

  findAll: async (req, res) => {
    const result = await productService.findAll();

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json(result.data);
  },

  findById: async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(422).json({
        erro: "O id informado é inválido.",
        detalhes: [
          {
            campo: "id",
            mensagem: "O id informado deve ser um número.",
          },
        ],
      });
    }

    const result = await productService.findById(id);

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json(result.data);
  },

  update: async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(422).json({
        erro: "O id informado é inválido.",
        detalhes: [
          {
            campo: "id",
            mensagem: "O id informado deve ser um número.",
          },
        ],
      });
    }

    const result = await productService.update(id, req.body);

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json({
      mensagem: result.mensagem,
    });
  },

  delete: async (req, res) => {
    const { id_produto } = req.body;

    if (id_produto === undefined || id_produto === null || Number.isNaN(Number(id_produto))) {
      return res.status(422).json({
        erro: "O campo id_produto é obrigatório.",
        detalhes: [
          {
            campo: "id_produto",
            mensagem: "O id_produto deve ser um número.",
          },
        ],
      });
    }

    const result = await productService.delete(Number(id_produto));

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json({
      mensagem: result.mensagem,
    });
  },
};

export const movementController = {
  register: async (req, res) => {
    const result = await movementService.register(req.body);

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json(result.data);
  },

  findAll: async (req, res) => {
    const result = await movementService.findAll();

    if (!result.success) {
      return res.status(result.status).json({
        erro: result.errors.map((e) => `${e.campo}: ${e.mensagem}`).join(", "),
        detalhes: result.errors,
      });
    }

    return res.status(result.status).json(result.data);
  },
};
