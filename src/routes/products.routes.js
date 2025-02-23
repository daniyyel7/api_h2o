import {Router}  from 'express'
import { 
    getInfoProduct,
    getProducts,
    getCategories,
    getProductsCategorie,
    createProduct,
} from '../controllers/products.controllers.js'

const router = Router();

//Crear un producto
router.post('/products/create',createProduct)



router.get('/products/infoProduct/:idProduct/:idTipoCliente', getInfoProduct)
router.get('/products/all/:user', getProducts)
router.get('/products/category', getCategories)
router.get('/products/byCategory/:id/:user', getProductsCategorie)


export default router;

