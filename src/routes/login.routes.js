import {Router}  from 'express'
import { 
    getLogin,
    registerClient
} from '../controllers/login.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.get('/login/:user/:key', getLogin);

router.post('/register', registerClient);


export default router;

