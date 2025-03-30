import {Router}  from 'express'
const router = Router();
import { 
    getDashboard

} from '../controllers/reports.controllers.js'


router.get('/reports/dashboard/:date', getDashboard)


export default router;

