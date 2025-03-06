import {Router}  from 'express'
import { ordersStatus,
    createOrder
 } from '../controllers/orders.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.post('/orders/createOrder', createOrder )


router.post('/orders/listDS', ordersStatus )




export default router;