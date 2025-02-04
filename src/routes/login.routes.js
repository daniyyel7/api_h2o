import {Router}  from 'express'
import { 
    getLogin,
} from '../controllers/login.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.get('/login/:user', getLogin);



export default router;

