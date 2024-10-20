import sql from 'mssql';
import { config } from 'dotenv';

config();

const dbSettings = {
    user : process.env.DBUSER,
    password : process.env.DBPASSWORD,
    server: process.env.DBSERVER,
    database : process.env.DATABASE,
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
