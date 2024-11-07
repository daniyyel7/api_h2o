import {Router}  from 'express'
import { 
    getTypeUsers, 
    getTypeUser,
    createTypeUser,
    updateType,
    deleteType,
    createUserStatus,
    createUser,
    updateUser
} from '../controllers/users.controllers.js'

const router = Router();

//Todos los tipos de usuarios
router.get('/typeUsers', getTypeUsers)
//Un tipo de usuarios
router.get('/typeUser/:id', getTypeUser)
router.post('/typeUser', createTypeUser)
router.put('/typeUser/:id', updateType)
router.delete('/typeUser/:id', deleteType)

//Crar un status para los usuarios
router.post('/status', createUserStatus)

//Crear un usuario
router.post('/user', createUser)

//Actualizacion de usuario
router.put('/user/:id', updateUser)


export default router;