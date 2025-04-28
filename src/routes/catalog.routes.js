import {Router}  from 'express'
import { 
    getActiveCategories,
} from '../controllers/catalog.controllers.js'

const router = Router();

router.get("/catalog/categories", getActiveCategories);

export default router;

