import sql from 'mssql';
import { config } from 'dotenv';


const dbSettings = {
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    server: process.env.DBSERVER,
    //server: "187.157.41.168/SAFYEULV",
    database : "IDS-APP",
    options : {
        encrypt: true,
        trustServerCertificate: true
    }
}

// Hace la conexión a la base de datos, si ocurre algo, se mostrara el error.
export const getConnection = async ()=> {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error(error);
    }
};
