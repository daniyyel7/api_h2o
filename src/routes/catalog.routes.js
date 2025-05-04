import {Router}  from 'express'
import { 
    getActiveCategories,
    getClientCustom,
} from '../controllers/catalog.controllers.js'

const router = Router();

router.get("/catalog/categories", getActiveCategories);

router.get("/catalog/clientCustom", getClientCustom);


export default router;

