import {Router}  from 'express'
import { 
    createModule
} from '../controllers/modules.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.post('/module/create', createModule)


export default router;



