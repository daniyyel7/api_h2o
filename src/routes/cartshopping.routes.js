import {Router}  from 'express'
import { 
    addProduct,
    updateCarProduct
} from '../controllers/cartshopping.controllers.js'

const router = Router();

//Insertar producto en carrito
router.post('/addcar', addProduct)
router.put('/updateCarProduct/:id', updateCarProduct)


export default router;
