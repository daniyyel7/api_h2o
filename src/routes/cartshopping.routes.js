import {Router}  from 'express'
import { 
    addProduct,
    updateCarProduct,
    productsCart
} from '../controllers/cartshopping.controllers.js'

const router = Router();

//Insertar producto en carrito
router.post('/addcar', addProduct)
router.put('/updateCarProduct/:id', updateCarProduct)
router.get('/cart/:id', productsCart)


export default router;
