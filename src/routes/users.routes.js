import {Router}  from 'express'
import { 
    getTypeUsers, 
    getTypeUser,
    createTypeUser,
    updateType,
    deleteType,
} from '../controllers/users.controllers.js'

const router = Router();

//Tipos de usuarios
router.get('/typeUsers', getTypeUsers)
router.get('/typeUser/:idType', getTypeUser)
router.post('/typeUser', createTypeUser)
router.put('/typeUser/:idType', updateType)
router.delete('/typeUser/:idType', deleteType)

export default router;