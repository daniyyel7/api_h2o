import express from "express";
import {
  addProductController,
  updateProductController,
  getCartProductsController,
} from "../controllers/cartshopping.controllers.js";

const router = express.Router();

router.post("/cart", addProductController);
router.put("/cart", updateProductController);
router.get("/cart/:userId", getCartProductsController);

export default router;
