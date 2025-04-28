import {Router}  from 'express'
import { 
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} from '../controllers/categories.controllers.js'

const router = Router();

//Crear una categoria
router.post('/categories/create',createCategory)

//Obtiene las categorias
router.get('/categories/categories', getCategories)

router.put('/categories/update/:id', updateCategory)

router.delete('/categories/delete/:id', deleteCategory)

export default router;

