import express, { json } from 'express'
import usersRoutes from "./routes/users.routes.js"

const  app =  express();

app.use(express.json());

app.use(usersRoutes);

export default app;