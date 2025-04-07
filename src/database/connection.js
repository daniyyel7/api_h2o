import sql from 'mssql';
import { config } from 'dotenv';

config();

const dbSettings = {
    user : "Desarrollo4",
    password : "Desarrollo4",
    //server: "172.16.30.240/SAFYEULV",
    server: "187.157.41.168/SAFYEULV",
    database : "IDS-APP",
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
