import e from "express";
import { getConnection } from "../database/connection.js";
import sql from "mssql";

//Valida los ingresos de cliente
export const clientLogin = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("user", sql.VarChar, req.body.user)
    .input("key", sql.VarChar, req.body.password)
    .query(
      "SELECT * FROM H2O.USERS WHERE nameUser = @user ; SELECT SCOPE_IDENTITY() AS idUser;"
    );
  if (result.rowsAffected[0] === 0) {
    return res
      .status(200)
      .json({ message: "user not found", access: false, data: {} });
  } else {
    const password = result.recordset[0].passwordUser;
    const user = result.recordset[0].nameUser;
    console.log(password);
    console.log(user);

    if (req.body.password != password) {
      return res.status(200).json({
        message: "incorrect  paswword",
        success: false,
        data: {},
      });
    } else {
      const result2 = await pool.query(
        `SELECT CA.idClient,CA.idUser, CA.nameClient, CA.firtsLastNameClient, CA.secondLastNameClient, CA.telephoneClient, CA.dateBirth, CA.urlPhotoClient, CA.idSex, CA.emailClient, U.idTypeUser
FROM H2O.CLIENTS_DATA CA
INNER JOIN H2O.USERS U ON CA.idUser = U.idUser
WHERE CA.idUser = ${result.recordset[0].idUser}`
      );
      const tokeJW = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lVXNlciI6ImRhbmllbDEwaGFzQHVsdi5lZHUubXgiLCJpYXQiOjE3NDI0MDI2NzIsImV4cCI6MTc0MzAwNzQ3Mn0.tbrJebP1ntq5x1wdVZjVB4Xl6vFzehmiP-VsqAslkes";

      return res.status(200).json({
        message: "acceso correcto",
        success: true,
        data: {
          idClient: result2.recordset[0].idClient,
          idUser: result2.recordset[0].idUser,
          nameClient: result2.recordset[0].nameClient,
          firtsLastNameClient: result2.recordset[0].firtsLastNameClient,
          secondLastNameClient: result2.recordset[0].secondLastNameClient,
          telephoneClient: result2.recordset[0].telephoneClient,
          urlPhotoClient: result2.recordset[0].urlPhotoClient,
          dateBirth: result2.recordset[0].dateBirth,
          idSex: result2.recordset[0].idSex,
          emailClient: result2.recordset[0].emailClient,
          idTypeUser: result2.recordset[0].idTypeUser,
          tokeFB: req.body.tokenFB,
          tokeJW: tokeJW,
        },
      });
    }
  }
};

//Valida los ingresos de staff
export const staffLogin = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("user", sql.NVarChar, req.body.user)
    .input("key", sql.NVarChar, req.body.password)
    .query(
      "SELECT * FROM H2O.USERS WHERE nameUser = @user ; SELECT SCOPE_IDENTITY() AS idUser;"
    );

  // Busca el usuario
  if (result.rowsAffected[0] === 0) {
    return res
      .status(200)
      .json({ message: "user not found", access: false, data: {} });
  }
  // Si lo encuentra
  else {
    //valida si las contraseñas coinciden
    const password = result.recordset[0].passwordUser;
    const user = result.recordset[0].nameUser;
    console.log(password);
    console.log(user);

    if (req.body.password != password) {
      return res.status(200).json({
        message: "incorrect  paswword",
        success: false,
        data: {},
      });
    }
    // Si tiene acceso el usario
    else {
      //Validar el token de FireBase
      const valToken = await pool
        .request()
        .input("tokenFB", sql.NVarChar, req.body.tokenFB)
        .query(
          "SELECT * FROM H2O.USER_FIREBASE_NOTIFICATION WHERE tokenFirebase = @tokenFB"
        );

      const tokeJW = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lVXNlciI6ImRhbmllbDEwaGFzQHVsdi5lZHUubXgiLCJpYXQiOjE3NDI0MDI2NzIsImV4cCI6MTc0MzAwNzQ3Mn0.tbrJebP1ntq5x1wdVZjVB4Xl6vFzehmiP-VsqAslkes";

      let valToken2;

      if (valToken.rowsAffected[0] === 0) {
        valToken2 = await pool
        .request()
          .input("tokenFB", sql.NVarChar, req.body.tokenFB)
          .input("idUser", sql.Int, result.recordset[0].idUser)
          .query(
            `INSERT INTO H2O.USER_FIREBASE_NOTIFICATION (idUser,tokenFirebase)VALUES(@idUser,@tokenFB)`
          );

      }

      const result2 =
        await pool.query(`SELECT SC.idStaff, SC.idUser, U.idTypeUser 
                          FROM H2O.STAFF_COMPANY AS SC
                          INNER JOIN  H2O.USERS U ON U.idUser = SC.idUser
                          WHERE SC.idUser = ${result.recordset[0].idUser}`);

      return res.status(200).json({
        message: "acceso correcto",
        success: true,
        data: {
          idStaff: result2.recordset[0].idStaff,
          idUser: result2.recordset[0].idUser,
          idTypeUser: result2.recordset[0].idTypeUser,
          tokeFB: req.body.tokenFB,
          tokeJW: tokeJW,
        },
      });
    }
  }
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
        `INSERT INTO H2O.USERS 
        (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation ) 
        VALUES (@nameUser, @password, @type, 1, GETDATE()); SELECT SCOPE_IDENTITY() AS idUser;`
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
      .input("sexo", sql.Int, req.body.sexo)
      .query(
        `INSERT INTO H2O.CLIENTS_DATA 
        (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, idSex) 
        VALUES ( @idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, 'https://h2o.isdapps.uk/public/image_profile.png' , @fechaNacimiento, @sexo); SELECT SCOPE_IDENTITY() AS idClient;`
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
