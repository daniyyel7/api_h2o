import {Router}  from 'express'
import { 
    getPriceProduct,
    getProducts,
    getCategories,
    getProductsCategorie
} from '../controllers/products.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.get('/priceproduct/:id/:user', getPriceProduct)
router.get('/products/:user', getProducts)
router.get('/categories', getCategories)
router.get('/productsCategorie/:id/:user', getProductsCategorie)


export default router;

