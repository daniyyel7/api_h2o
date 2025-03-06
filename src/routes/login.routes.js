import {Router}  from 'express'
import { 
    clientLogin,
    staffLogin,
    registerClient,
} from '../controllers/login.controllers.js'

const router = Router();

//Crear un modulo para los usuarios
router.post('/auth/login-client', clientLogin);

router.post('/auth/loginstaff', staffLogin);

router.post('/auth/register', registerClient);


export default router;

