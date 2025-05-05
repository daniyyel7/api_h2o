import { Router } from "express";
import {
  ordersStatus,
  autoriceOrder,
  cancelOrder,
  createOrder,
  rejectedOrder,
  listOrdersAdmin,
  deliveryOrder,
  undeliveredOrder,
  detailOrder,
  listOrdersByClient,
  listOrdersDebtByClient,
  updateStatusPayment,
  listOrdersDebtForAdmin,
} from "../controllers/orders.controllers.js";

const router = Router();

//* Para crear una orden por parte del cliente
router.post("/orders/createOrder", createOrder);

//* Para cancelar una orden por parte del cliente
router.post("/orders/cancel",cancelOrder);

//* Para cancelar una orden por parte del administrador
router.post("/orders/rejected",rejectedOrder);

//* Para autorizar una orden por parte del administrador
router.post("/orders/autorice",autoriceOrder);

//* Para marcar una orden entrega por el repartidor
router.post("/orders/orderDelivered", deliveryOrder);

//* Para marcar una no orden entrega por el repartidor
router.post("/orders/orderUndelivered", undeliveredOrder);

//* Para que el administrador pueda marcar una orden como pagada despues de entregarla
router.post("/orders/payment", updateStatusPayment);


router.post("/orders/listAdmin", listOrdersAdmin);
router.post("/orders/listOrderDetail", ordersStatus);
router.get("/orders/detailOrder/:idOrder", detailOrder);
router.get("/orders/listOrderByClient/:idClient", listOrdersByClient);
router.get("/orders/debtbyclient/:idClient", listOrdersDebtByClient);


router.get("/orders/alldebt", listOrdersDebtForAdmin);

export default router;
