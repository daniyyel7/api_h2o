import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const getTypeUsers = async (req,res) => {
    const pool = await getConnection()
    const result = await pool.request().query("SELECT * FROM H2O.USERS_TYPE")
    res.json(result.recordset)
};

export const getTypeUser = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query("SELECT * FROM MIY_USERS_TYPE WHERE idTypeUser = @id")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.json(result.recordset[0]);
};

export const createTypeUser = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .query('INSERT INTO MIY_USERS_TYPE (nameType) VALUES (@name); SELECT SCOPE_IDENTITY() AS idTypeUser;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not create type"});
    }
    res.status(200).json({
        message : "type of user create",
        id : result.recordset[0].idTypeUser,
        ame : req.body.name
    });
};

export const updateType = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("name", sql.VarChar, req.body.name)
    .query("UPDATE MIY_USERS_TYPE SET nameType = @name WHERE idTypeUser = @id");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "type not found not updated"});
    }
    return res.status(201).json({ 
        message : "type updated",
        id : req.params.id, 
        name : req.body.name 
    });
};

export const deleteType =  async( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.idType)
    .query("DELETE FROM MIY_USERS_TYPE WHERE idTypeUser = @id");
    if( result.rowsAffected[0] === 0 ) {
        return res.status(404).json({ message : "User not foun not deleted"})
    }
    return res.json({ message : "user deleted"})
};

//Crear un status para usuario
export const createUserStatus = async (req,res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .query('INSERT INTO MIY_USERS_STATUS (nameStatus) VALUES (@name); SELECT SCOPE_IDENTITY() AS idStatusUser;');
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
    .query('INSERT INTO MIY_USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@name, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;');
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
    .query("UPDATE MIY_USERS SET nameUser = @name, passwordUser = @password, idTypeUser = @type, idStatusUser = @status WHERE idUser = @id");
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



//Crea un registo de cliente, publico general o insitucional
export const registerClient = async (req, res) => {
    const pool = await getConnection();

    //validamos si existe ya un registro del correo electronico
    const existe = await pool
    .request()
    .input("correo", sql.VarChar, req.body.correo)
    .query("SELECT idUser FROM MIY_USERS WHERE nameUser = @correo");
    if (existe.rowsAffected[0] === 0) {
        
        // Validar que el correo contenga el dominio institucional
        let typeClient = 5;
        if (req.body.correo && /@ulv\.edu\.mx$/.test(req.body.correo)) {
            typeClient = 4;
        }

        const result = await pool
        .request()
        .input("nameUser", sql.VarChar, req.body.correo)
        .input("password", sql.VarChar, req.body.password)
        .input("type", sql.Int, typeClient)
        .query('INSERT INTO MIY_USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@nameUser, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;');
        
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
            .query('INSERT INTO MIY_CLIENTS_DATA (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, sexo) VALUES ( @idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, \'http://34.123.11.193:3000/public/image_profile.png\' , @fechaNacimiento, @sexo); SELECT SCOPE_IDENTITY() AS idClient;');
            
        return res.status(200).json({ 
                message : "usuario creado correctamente"
            });
    }
    else
    {
       
        return res.status(200).json({ message : "el usuario ya existe" });    
    }
   
};






