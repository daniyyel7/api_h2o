import express from "express";
import {
  addProductController,
  updateProductController,
  getCartProductsController,
} from "../controllers/cartshopping.controllers.js";

const router = express.Router();

router.post("/cart/add", addProductController);
router.put("/cart/updateProduct/:id", updateProductController);
router.get("/cart//products/:id", getCartProductsController);

export default router;
