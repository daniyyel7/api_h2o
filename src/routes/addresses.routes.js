import {Router}  from 'express'
import { 
    allZipCode,
    createAdresses,
    addressesByClient,
    updateAddress,
    deleteAddress
} from '../controllers/addresses.controllers.js'

const router = Router();

//Insertar producto en carrito
router.get('/addresses/zipCode', allZipCode)
router.post('/addresses/create', createAdresses)
router.get('/addresses/:id', addressesByClient )
router.put('/addresses/:idAddress', updateAddress )
router.delete('/addresses/:idAddress', deleteAddress )
//router.get('/cart/products/:id', productsCart)


export default router;
