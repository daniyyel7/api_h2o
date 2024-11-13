import {Router}  from 'express'
import { 
    getPriceProduct,
    getProducts
} from '../controllers/products.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.get('/priceproduct/:id/:user', getPriceProduct)
router.get('/products/:user', getProducts)


export default router;

