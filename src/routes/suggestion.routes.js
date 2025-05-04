import {Router}  from 'express'
import { 
    createComment,
    getCommentsClient,
    readComment,
    getCommentsNotRead,
    getCommentsRead,
} from '../controllers/suggestion.controllers.js'


const router = Router();

router.post('/suggestion/create', createComment);

router.get('/suggestion/client', getCommentsClient);

router.get('/suggestion/notread', getCommentsNotRead);

router.get('/suggestion/read', getCommentsRead);

router.put('/suggestion/read/:idComment', readComment);

export default router;


