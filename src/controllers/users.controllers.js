import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const getTypeUsers = async (req,res) => {
    const pool = await getConnection()
    const result = await pool.request().query("SELECT * FROM H2O.USERS_TYPE")
    return res.status(200).json({
        succes : true,
        message: "tipos de usuarios",
        data: result.recordset,
    })
};


export const getTypeUser = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query("SELECT * FROM H2O.USERS_TYPE WHERE idTypeUser = @id")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.status(200).json({
        succes: true,
        message: 'Tipo de usaurio',
        data: result.recordset[0]});
};

export const createTypeUser = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .query('INSERT INTO H2O.USERS_TYPE (nameType) VALUES (@name); SELECT SCOPE_IDENTITY() AS idTypeUser;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create type"});
    }
    res.status(200).json({
        succes: true,
        message : "type of user create",
        data: {
            id : result.recordset[0].idTypeUser,
            name : req.body.name,
        }
    });
};

export const updateType = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("name", sql.VarChar, req.body.name)
    .query("UPDATE H2O.USERS_TYPE SET nameType = @name WHERE idTypeUser = @id");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "type not found not updated"});
    }
    return res.status(201).json({ 
        succes: true,
        message : "type updated",
        data:{
            id : req.params.id, 
            name : req.body.name, 
        }
    });
};

export const deleteType =  async( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.idType)
    .query("DELETE FROM H2O.USERS_TYPE WHERE idTypeUser = @id");
    if( result.rowsAffected[0] === 0 ) {
        return res.status(404).json({ message : "User not foun not deleted"})
    }
    return res.status(200).json({ 
        succes: true,
        message : "user deleted",
        data:""
    })
};

//Crear un status para usuario
export const createUserStatus = async (req,res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .query('INSERT INTO H2O.USERS_STATUS (nameStatus) VALUES (@name); SELECT SCOPE_IDENTITY() AS idStatusUser;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create type"});
    }
    res.status(200).json({
        message : "status of user create",
        id : result.recordset[0].idStatusUser,
        ame : req.body.name
    });
};


//Crear un usuario
export const createUser = async (req,res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .input("password", sql.VarChar, req.body.password)
    .input("type", sql.Int, req.body.type)
    .query('INSERT INTO H2O.USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@name, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create user"});
    }
    res.status(200).json({
        message : "user create",
        id : result.recordset[0].idUser,
        name : req.body.name,
        password : req.body.password,
        type : req.body.type,
    });
};

//Actualizar estatus de un usuario
export const updateUser = async (req,res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("name", sql.VarChar, req.body.name)
    .input("password", sql.VarChar, req.body.password)
    .input("type", sql.Int, req.body.type)
    .input("status", sql.Int, req.body.status)
    .query("UPDATE H2O.USERS SET nameUser = @name, passwordUser = @password, idTypeUser = @type, idStatusUser = @status WHERE idUser = @id");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "user not found not updated"});
    }
    return res.status(201).json({ 
        message : "user updated",
        id : req.params.id, 
        name : req.body.name,
        password : req.body.password,
        type : req.body.type,
        status : req.body.status
    });
};






