import express from "express";
import {
  productController,
  movementController,
} from "../controllers/estoqueController.js";

const router = express.Router();

// PRODUTOS
router.post("/add_produto", productController.create);
router.get("/listar_produtos", productController.findAll);
router.get("/listar_produto/:id", productController.findById);
router.put("/atualizar_produto/:id", productController.update);
router.delete("/deletar_produto", productController.delete);

// MOVIMENTAÇÕES
router.post("/movimentar_produto", movementController.register);
router.get("/listar_movimentacoes", movementController.findAll);

export default router;
