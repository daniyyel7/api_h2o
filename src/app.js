import express from 'express';
import usersRoutes from './routes/users.routes.js';
import modulesRoutes from './routes/modules.routes.js';
import cartshoppingRoutes from './routes/cartshopping.routes.js';
import productsRoutes from './routes/products.routes.js';
import loginRoutes from './routes/login.routes.js';
import ordersRoutes from './routes/orders.routes.js'
import addressesRoutes from './routes/addresses.routes.js'
import reportRoutes from './routes/reports.routes.js'

// Swagger documentación
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(express.json());

// Rutas
app.use(usersRoutes);
app.use(modulesRoutes);
app.use(cartshoppingRoutes);
app.use(productsRoutes);
app.use(loginRoutes);
app.use(ordersRoutes);
app.use(addressesRoutes);
app.use(reportRoutes);

// Obtener la ruta absoluta del archivo `swagger.json`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, 'swagger.json');

// Leer y parsear el archivo JSON de Swagger
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/public', express.static(path.join(__dirname, 'public')));

export default app;
