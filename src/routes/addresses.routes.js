import {Router}  from 'express'
import { 
    allZipCode,
    createAdresses,
    addressesByClient
} from '../controllers/addresses.controllers.js'

const router = Router();

//Insertar producto en carrito
router.get('/addresses/zipCode', allZipCode)
router.post('/addresses/create', createAdresses)
router.get('/addresses/:id', addressesByClient )
//router.get('/cart/products/:id', productsCart)


export default router;
