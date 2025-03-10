import express from "express";
import {
  addProductToCart,
  updateCartProduct,
  productsCart,
} from "../controllers/cartshopping.controllers.js";

const router = express.Router();

router.post("/cart/add", addProductToCart);
router.put("/cart/updateProduct/:id", updateCartProduct);
router.get("/cart/products/:id", productsCart);

export default router;
