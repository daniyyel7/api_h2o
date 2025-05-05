import {Router}  from 'express'
const router = Router();
import { 
    getDashboard,
    getOrdersReportByPayment,
} from '../controllers/reports.controllers.js'


router.get('/reports/dashboard/:date', getDashboard)


router.post('/reports/salesbytypepayment', getOrdersReportByPayment)


export default router;

