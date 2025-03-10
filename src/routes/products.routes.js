import {Router}  from 'express'
import * as productController from '../controllers/products.controllers.js';

 
//const router = express.Router();
// import { 
//     getPriceProduct,
//     getProducts,
//     getCategories,
//     getProductsCategorie
// } from '../controllers/products.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
// router.get('/priceproduct/:id/:user', getPriceProduct)
// router.get('/products/:user', getProducts)
// router.get('/categories', getCategories)
// router.get('/productsCategorie/:id/:user', getProductsCategorie)

router.get('/price/:id/:user', productController.getPriceProduct);
router.get('/products/:user', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/products/categorie/:id/:user', productController.getProductsCategorie);


export default router;

