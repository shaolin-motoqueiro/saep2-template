export const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    erro: "Erro interno do servidor.",
    detalhes: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
