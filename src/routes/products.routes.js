import {Router}  from 'express'
import { 
    getPriceProduct
} from '../controllers/products.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.get('/priceproduct/:id/:user', getPriceProduct)


export default router;

