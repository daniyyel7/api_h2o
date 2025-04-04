import { Router } from "express";
import {
  ordersStatus,
  autoriceOrder,
  cancelOrder,
  createOrder,
  rejectedOrder,
  listOrdersAdmin,
  detailOrder,
  listOrdersByClient
} from "../controllers/orders.controllers.js";

const router = Router();

router.post("/orders/createOrder", createOrder);
router.post("/orders/cancel",cancelOrder);
router.post("/orders/autorice",autoriceOrder);
router.post("/orders/rejected",rejectedOrder);
router.post("/orders/listAdmin", listOrdersAdmin);
router.post("/orders/listOrderDetail", ordersStatus);
router.get("/orders/detailOrder/:idOrder", detailOrder);
router.get("/orders/listOrderByClient/:idClient", listOrdersByClient);

export default router;
