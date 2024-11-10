import express from 'express';
import usersRoutes from './routes/users.routes.js';
import modulesRoutes from './routes/modules.routes.js';
import cartshoppingRoutes from './routes/cartshopping.routes.js';

// Swagger documentación
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Middleware
app.use(express.json());

// Rutas
app.use('/users', usersRoutes);
app.use('/modules', modulesRoutes);
app.use('/cartshopping', cartshoppingRoutes);

// Obtener la ruta absoluta del archivo `swagger.json`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, 'swagger.json');

// Leer y parsear el archivo JSON de Swagger
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
