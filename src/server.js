import { config } from 'dotenv';
import app from './app.js';

config();

const port = process.env.PORT || 4000;

//Puerto que escucha
app.listen(port,()=> console.log("Server listening on port",port));
