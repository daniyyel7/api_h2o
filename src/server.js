import { config } from 'dotenv';
import app from './app.js';
import productRoutes from './routes/products.routes.js';
import express from 'express';

config();

app.use(express.json());

// Usando rutas
app.use('/api', productRoutes);

const port = process.env.PORT || 4000;

//Puerto que escucha
app.listen(port,()=> console.log("Server listening on port",port));
