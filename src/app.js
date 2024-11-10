import express from 'express';
import usersRoutes from './routes/users.routes.js';
import modulesRoutes from './routes/modules.routes.js';
import cartshoppingRoutes from './routes/cartshopping.routes.js';

// Swagger documentacion
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

const  app =  express();
app.use(express.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(usersRoutes);

app.use(modulesRoutes);

app.use(cartshoppingRoutes);


export default app;