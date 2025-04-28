import {Router}  from 'express'
import { 
    getAllImages,
    deleteImage,
} from '../controllers/carousel.controllers.js'

const router = Router();


router.delete('/carousel/:id', deleteImage);

router.get('/carousel', getAllImages);


export default router;

