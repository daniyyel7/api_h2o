import { Router } from "express";
import {
  ordersStatus,
  createOrder,
  listOrdersAdmin,
  detailOrder,
  listOrdersByClient
} from "../controllers/orders.controllers.js";

const router = Router();

//Crear un modulo para los usuarios
router.post("/orders/createOrder", createOrder);

router.post("/orders/listAdmin", listOrdersAdmin);
router.post("/orders/listOrderDetail", ordersStatus);

router.get("/orders/detailOrder/:idOrder", detailOrder);

router.get("/orders/listOrderByClient/:idClient", listOrdersByClient);

export default router;
