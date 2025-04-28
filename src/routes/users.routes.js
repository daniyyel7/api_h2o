import {Router}  from 'express'
import { 
    getTypeUsers, 
    getTypeUser,
    createTypeUser,
    updateType,
    deleteType,
    createUserStatus,
    createUser,
    updateUser,
    createDelivery,
    getDelivery,
    updateDelivery,
    deleteUser,
} from '../controllers/users.controllers.js'

const router = Router();

//Todos los tipos de usuarios
router.get('/users/typeUsers', getTypeUsers)
//Un tipo de usuarios
router.get('/users/typeUser/:id', getTypeUser)
router.post('/users/typeUser', createTypeUser)
router.put('/users/typeUser/:id', updateType)
router.delete('/users/typeUser/:id', deleteType)

//Crar un status para los usuarios
router.post('/users/status', createUserStatus)

//Crear un usuario
router.post('/users/create', createUser)


//Actualizacion de usuario
router.put('/users/update/:id', updateUser)

//Create delivery
router.post('/users/createDelivery', createDelivery)
router.post('/users/updateDelivery', updateDelivery)
router.get('/users/deliverys', getDelivery)

router.delete('/users/delete/:idUser', deleteUser)

export default router;