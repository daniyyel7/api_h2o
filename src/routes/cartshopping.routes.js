import {Router}  from 'express'
import { 
    addProduct,
    updateCarProduct,
    productsCart
} from '../controllers/cartshopping.controllers.js'

const router = Router();

//Insertar producto en carrito
router.post('/cart/add', addProduct)
router.put('/cart/updateProduct/:id', updateCarProduct)
router.get('/cart/products/:id', productsCart)


export default router;
