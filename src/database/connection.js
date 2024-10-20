import sql from 'mssql';
import { config } from 'dotenv';

config();

const dbSettings = {
    user : "kaiomiyana",
    password : "ssdIDS2024#",
    server: "idsmiyana.database.windows.net",
    database : "miyana",
    options : {
        encrypt: true,
        trustServerCertificate: false
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
