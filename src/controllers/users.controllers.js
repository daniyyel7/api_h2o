import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const getTypeUsers = async (req,res) => {
    const pool = await getConnection()
    const result2 = await pool.request().query("SELECT * FROM MIY_USERS_TYPES")
    res.json(result2.recordset)
};

export const getTypeUser = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("idType", sql.Int, req.params.idType)
    .query("SELECT * FROM MIY_USERS_TYPES WHERE idType = @idType")
    console.log(result.recordset[0])
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.json(result.recordset[0]);
};

export const createTypeUser = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("nameType", sql.VarChar, req.body.nameType)
    .query('INSERT INTO MIY_USERS_TYPES (nameType) VALUES (@nameType); SELECT SCOPE_IDENTITY() AS idType;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create type"});
    }
    res.status(200).json({
        message : "type create",
        "idType" : result.recordset[0].idType,
        "nameType" : req.body.nameType
    });
};

export const updateType = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("idType", sql.Int, req.params.idType)
    .input("nameType", sql.VarChar, req.body.nameType)
    .query("UPDATE MIY_USERS_TYPES SET nameType = @nameType WHERE idType = @idType");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "type not found not updated"});
    }
    return res.status(201).json({ 
        message : "type updated",
        idType : req.params.idType, 
        nameType : req.body.nameType 
    });
};

export const deleteType =  async( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("idType", sql.Int, req.params.idType)
    .query("DELETE FROM MIY_USERS_TYPES WHERE idType = @idType");
    if( result.rowsAffected[0] === 0 ) {
        return res.status(404).json({ message : "User not foun not deleted"})
    }
    return res.json({ message : "user deleted"})
};