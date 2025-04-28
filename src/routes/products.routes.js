import {Router}  from 'express'
import { 
    getInfoProduct,
    getProducts,
    getCategories,
    getProductsCategorie,
    createProduct,
    getAllProducts,
    getProductsWithPrices,
    deleteProduct,
    upsertProductPrice,
} from '../controllers/products.controllers.js'

const router = Router();

//Crear un producto
router.post('/products/create',createProduct)



router.get('/products/infoProduct/:idProduct/:idTipoCliente', getInfoProduct)
router.get('/products/all/:user', getProducts)
router.get('/products/category', getCategories)
router.get('/products/byCategory/:id/:user', getProductsCategorie)

router.get('/products/all', getAllProducts)

router.get('/products/allWithPrice', getProductsWithPrices)


router.delete("/products/:idProduct", deleteProduct);

router.post("/products/price", upsertProductPrice);


export default router;

