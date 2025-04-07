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
        success: true,
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
        success: true,
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
        success: true,
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
        success: true,
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
        return res.status(404).json({ 
            success: false,
            message : "error could not create user",
            data: {},
        });
    }
    res.status(200).json({
        success: true,
        message : "status of user create",
        data: {
            id : result.recordset[0].idStatusUser,
            ame : req.body.name
        },
    });
};

//Crear un usuario
export const createUser = async (req,res) => {
    const pool = await getConnection();

    

    const existe = await pool
    .request()
    .input("nameUser", sql.VarChar, req.body.nameUser)
    .query("SELECT idUser FROM H2O.USERS WHERE nameUser = @nameUser");

    if (existe.rowsAffected[0] != 0) {
        return res.status(404).json({ 
            success: false,
            message : "error user exist",
            data: {},
        });
    }





    const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .input("password", sql.VarChar, req.body.password)
    .input("type", sql.Int, req.body.type)
    .query('INSERT INTO H2O.USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@name, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ 
            success: false,
            message : "error could not create user",
            data: {},
        });
    }
    res.status(200).json({
        success: true,
        message : "user create",
        data: {
            id : result.recordset[0].idUser,
            name : req.body.name,
            password : req.body.password,
            type : req.body.type,
        }
    });
};

//Crea un registo de cliente, publico general o insitucional
export const registerClient = async (req, res) => {
  const pool = await getConnection();

  //validamos si existe ya un registro del correo electronico
  const existe = await pool
    .request()
    .input("correo", sql.VarChar, req.body.correo)
    .query("SELECT idUser FROM H2O.USERS WHERE nameUser = @correo");
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
      .query(
        "INSERT INTO H2O.USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) VALUES (@nameUser, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;"
      );

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
      .query(
        "INSERT INTO H2O.CLIENTS_DATA (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, sexo) VALUES ( @idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, 'https://h2o.isdapps.uk/public/image_profile.png' , @fechaNacimiento, @sexo); SELECT SCOPE_IDENTITY() AS idClient;"
      );

    return res.status(200).json({
      success: true,
      message: "usuario creado correctamente",
      data: {
        idUser: sql.Int,
        idUser,
        idClient: result.recordset[0].idClient,
        nameClient: req.body.nombre,
        firtsLastNameClient: req.body.apellidoPaterno,
        secondLastNameClient: req.body.apellidoMaterno,
        telephoneClient: req.body.telefono,
        dateBirth: req.body.fechaNacimiento,
        sexo: req.body.sexo,
      },
    });
  } else {
    return res.status(200).json({
      success: false,
      message: "el usuario ya existe",
      data: {},
    });
  }
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
        return res.status(404).json({ 
            success: false,
            message : "user not found not updated",
            data: {},
        });
    }
    return res.status(201).json({ 
        success: true,
        message : "user updated",
        data:{
            id : req.params.id, 
            name : req.body.name,
            password : req.body.password,
            type : req.body.type,
            status : req.body.status,
        },
    });
};






