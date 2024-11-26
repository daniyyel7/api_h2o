import sql from 'mssql';
import { config } from 'dotenv';

config();

const dbSettings = {
    user : "miyanabd",
    password : "apoca320",
    server: "35.202.95.134",
    database : "miyana",
    options : {
        encrypt: true,
        trustServerCertificate: true
    }
}

export const getConnection = async ()=> {
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.error(error);
    }
};
