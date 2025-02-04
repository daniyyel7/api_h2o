import { getConnection, sql } from "../database/connection.js";
import { queries } from "../models/querys/loginQuery.js";

export const findUserByUsername = async (username) => {
    try {
        const pool = await getConnection();
        const result = await pool
        .request()
        .input("user", sql.VarChar, username)
        .query(queries.getUserByName);
        return result.recordset[0] || null; // Retorna el usuario encontrado o undefined
    } catch (error) {
        console.log(error);
        return error;        
    }
};