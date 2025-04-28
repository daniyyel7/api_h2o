import {Router}  from 'express'
import { 
    getInformation, 
} from '../controllers/clients.controllers.js'

const router = Router();

router.get('/client/profile/:idClient', getInformation)

export default router;