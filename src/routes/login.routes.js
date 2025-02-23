import {Router}  from 'express'
import { 
    getLogin,
    registerClient
} from '../controllers/login.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.post('/auth/login', getLogin);

router.post('/auth/register', registerClient);


export default router;

