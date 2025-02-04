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

export const userExiste = async (req) => {
    try {
        const pool = await getConnection();
        const result = await pool
        .request()
        .input("correo", sql.VarChar, req.body.correo)
        .query(queries.validateUser);
        return result.recordset[0] || null; // Retorna el usuario encontrado o undefined
    } catch (error) {
        console.log(error);
        return error;        
    }
};

export const createUser = async (req, typeClient) => {
    try {
        const pool = await getConnection();   
        const result = await pool
        .request()
        .input("nameUser", sql.VarChar, req.body.correo)
        .input("password", sql.VarChar, req.body.password)
        .input("type", sql.Int, typeClient)
        .query(queries.insertUser);

        const idUser = result.recordset[0].idUser;

        if (!idUser) {
            return res.status(500).json({ message: "Error al crear el usuario" });
        }

        await pool

        .request()
        .input("idUser", sql.Int, idUser)
        .input("nombre", sql.VarChar, req.body.nombre)
        .input("apellidoPaterno", sql.VarChar, req.body.apellidoPaterno)
        .input("apellidoMaterno", sql.VarChar, req.body.apellidoMaterno)
        .input("telefono", sql.VarChar, req.body.telefono)
        .input("fechaNacimiento", sql.Date, req.body.fechaNacimiento)
        .input("sexo", sql.Char, req.body.sexo)
        .query(queries.insertClient);
        
        await pool

        .request()
        .input("correo", sql.VarChar, req.body.correo)
        .query(queries.validateUser);

        console.log(result.recordset[0]);

        return result.recordset[0];// Retorna el usuario encontrado o undefined
    } catch (error) {
        console.log(error);
        return error;        
    }
};
