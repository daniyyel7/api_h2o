import sql from 'mssql';
import { config } from 'dotenv';

config();

const dbSettings = {
    user : "sa",
    password : "H2oUlV#25",
    server: "Localhost",
    database : "IDSAPP",
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
