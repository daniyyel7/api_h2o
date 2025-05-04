import { getConnection } from "../database/connection.js";
import sql from "mssql";
import { sendEmail } from "../util/email.js";

export const getInformation = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("idUser", sql.Int, req.params.idClient).query(`
        SELECT 
        idUser, [name], telephone, urlImg,
        CASE
        WHEN email IS NULL THEN 'sin correo' ELSE email END AS email
        FROM (SELECT
        idUser, CONCAT_WS(' ', nameClient, firtsLastNameClient, secondLastNameClient) AS [name], 
        telephoneClient AS telephone, 
        urlPhotoClient AS urlImg,
        emailClient AS email
        FROM H2O.CLIENTS_DATA 
        UNION
        SELECT 
        idUser, CONCAT_WS(' ', nameStaff, firtsLastNameStaff, secondLastNameStaff) AS [name], 
        telephoneStaff AS telephone, 
        urlPhotoStaff AS urlImg,
        emailStaff AS email
        FROM H2O.STAFF_COMPANY) AS DUP
        WHERE DUP.idUser = @idUser
        `);
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "type not found" });
  }
  return res.status(200).json({
    success: true,
    message: "informacion de perfil del cliente",
    data: {
      name: result.recordset[0].name,
      telephone: result.recordset[0].telephone,
      urlImg: result.recordset[0].urlImg,
      email: result.recordset[0].email,
    },
  });
};

export const getAllClientCustom = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("idClient", sql.Int, req.params.idClient).query(` SELECT
    U.idUser, CD.idClient, 
    CONCAT_WS(' ',CD.nameClient,CD.firtsLastNameClient, CD.secondLastNameClient) AS nameCompleteClient, CS.descriptionSex, CASE WHEN CD.emailClient IS NULL THEN '' ELSE CD.emailClient END AS emailClient,
    U.nameUser, U.passwordUser, UT.nameType, UT.typeUser, US.nameStatus, U.dateCreation, CD.telephoneClient, CD.urlPhotoClient, CD.nameClient, CD.firtsLastNameClient, CD.secondLastNameClient, CS.initalSex
    FROM H2O.USERS AS U
    INNER JOIN H2O.CLIENTS_DATA AS CD ON U.idUser = CD.idUser 
    INNER JOIN H2O.USERS_TYPE AS UT ON U.idTypeUser = UT.idTypeUser
    INNER JOIN H2O.USERS_STATUS AS US ON U.idStatusUser = US.idStatusUser
    INNER JOIN H2O.CAT_SEX AS CS ON CD.idSex = CS.idSex
    WHERE UT.typeUser = 'CUSTOM' AND U.idStatusUser = 1 `);
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({ message: "type not found" });
  }
  return res.status(200).json({
    success: true,
    message: "informacion clientes custom",
    data: result.recordset,
  });
};

export const createClientCustom = async (req, res) => {
  try {
    const pool = await getConnection();

    const {
      nameUser,
      password,
      idType,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      fechaNacimiento,
      idSex,
      email,
    } = req.body;

    if (
      !nameUser ||
      !password ||
      !idType ||
      !nombre ||
      !apellidoPaterno ||
      !telefono ||
      !fechaNacimiento ||
      !email ||
      idSex === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios.",
        data: {},
      });
    }

    // Validar si ya existe el usuario
    const existe = await pool
      .request()
      .input("nameUser", sql.VarChar, nameUser)
      .query("SELECT idUser FROM H2O.USERS WHERE nameUser = @nameUser");

    if (existe.rowsAffected[0] > 0) {
      return res
        .status(200)
        .json({ success: false, message: "El usuario ya existe.", data: {} });
    }

    // Insertar en tabla USERS
    const userResult = await pool
      .request()
      .input("nameUser", sql.NVarChar, nameUser)
      .input("password", sql.NVarChar, password)
      .input("idType", sql.Int, idType).query(`
        INSERT INTO H2O.USERS (nameUser, passwordUser, idTypeUser, idStatusUser, dateCreation) 
        VALUES (@nameUser, @password, @idType, 1, GETDATE());
        SELECT SCOPE_IDENTITY() AS idUser;
      `);

    const idUser = userResult.recordset[0].idUser;

    if (!idUser) {
      return res
        .status(500)
        .json({ success: false, message: "Error al crear el usuario." });
    }

    // Insertar en tabla CLIENTS_DATA
    const clientResult = await pool
      .request()
      .input("idUser", sql.Int, idUser)
      .input("nombre", sql.NVarChar, nombre)
      .input("apellidoPaterno", sql.NVarChar, apellidoPaterno)
      .input("apellidoMaterno", sql.NVarChar, apellidoMaterno || null)
      .input("telefono", sql.NVarChar, telefono)
      .input("fechaNacimiento", sql.Date, fechaNacimiento)
      .input("email", sql.NVarChar, email)
      .input("idSex", sql.Int, idSex).query(`
        INSERT INTO H2O.CLIENTS_DATA (idUser, nameClient, firtsLastNameClient, secondLastNameClient, telephoneClient, urlPhotoClient, dateBirth, idSex) 
        VALUES (@idUser, @nombre, @apellidoPaterno, @apellidoMaterno, @telefono, 'https://h2o.isdapps.uk/public/image_profile.png', @fechaNacimiento, @idSex);
        SELECT SCOPE_IDENTITY() AS idClient;
      `);

    const idClient = clientResult.recordset[0].idClient;

    return res.status(200).json({
      success: true,
      message: "Usuario creado correctamente",
      data: {
        idUser,
        idClient,
        nameClient: nombre,
        firtsLastNameClient: apellidoPaterno,
        secondLastNameClient: apellidoMaterno,
        telephoneClient: telefono,
        dateBirth: fechaNacimiento,
        idSex,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
};

export const updateClientCustom = async (req, res) => {
  try {
    const pool = await getConnection();

    const {
      idUser,
      password,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      telefono,
      fechaNacimiento,
      idSex,
      email,
    } = req.body;

    if (
      !idUser ||
      !password ||
      !nombre ||
      !apellidoPaterno ||
      !telefono ||
      !fechaNacimiento ||
      !email ||
      idSex === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios.",
        data: {},
      });
    }

    // Validar si ya existe el usuario
    const existe = await pool
      .request()
      .input("idUser", sql.Int, idUser)
      .query("SELECT idUser FROM H2O.USERS WHERE idUser = @idUser");

    if (existe.rowsAffected[0] < 0) {
      return res
        .status(404)
        .json({ success: false, message: "El usuario no existe.", data: {} });
    }
    // Insertar en tabla USERS
    const updateResult = await pool
      .request()
      .input("idUser", sql.Int, idUser)
      .input("password", sql.NVarChar, password)
      .input("nombre", sql.NVarChar, nombre)
      .input("apellidoPaterno", sql.NVarChar, apellidoPaterno)
      .input("apellidoMaterno", sql.NVarChar, apellidoMaterno || null)
      .input("telefono", sql.NVarChar, telefono)
      .input("fechaNacimiento", sql.Date, fechaNacimiento)
      .input("email", sql.NVarChar, email)
      .input("idSex", sql.Int, idSex).query(`
        UPDATE H2O.USERS 
        SET passwordUser = @password
        WHERE idUser = @idUser

        UPDATE H2O.CLIENTS_DATA
        SET 
        nameClient = @nombre,
        firtsLastNameClient = @apellidoPaterno,
        secondLastNameClient = @apellidoMaterno,
        telephoneClient = @telefono,
        dateBirth = @fechaNacimiento,
        emailClient = @email,
        idSex = @idSex
        WHERE idUser = @idUser
      `);

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: {},
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { nameUser } = req.body;
  if (!nameUser) return res.status(400).json({ message: "Correo requerido" });

  const pool = await getConnection();

  // Verificar si existe el usuario
  const result = await pool
    .request()
    .input("nameUser", sql.NVarChar, nameUser)
    .query("SELECT idUser FROM H2O.USERS WHERE nameUser = @nameUser");

  if (result.rowsAffected[0] === 0) {
    return res
      .status(200)
      .json({
        success: false,
        message: "Revisa el correo registrado",
        data: {},
      });
  }

  // Generar código y tiempo de expiración
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  // Guardar código
  await pool
    .request()
    .input("nameUser", sql.VarChar, nameUser)
    .input("code", sql.VarChar, code)
    .input("dateExpiration", sql.DateTime, expiration).query(`
      INSERT INTO H2O.PASSWORD_RESET_CODES (nameUser, code, dateExpiration)
      VALUES (@nameUser, @code, @dateExpiration)
    `);

  const dataEmail = { nameUser: nameUser, code: code };
  // Enviar correo
  await sendEmail(nameUser, "code", dataEmail);

  res
    .status(200)
    .json({
      success: true,
      message: "Código enviado al correo registrado",
      data: {},
    });
};

export const verifyResetCode = async (req, res) => {
  const { nameUser, code } = req.body;
  if (!nameUser || !code)
    return res.status(400).json({ message: "Datos incompletos." });

  const pool = await getConnection();
  const result = await pool
    .request()
    .input("nameUser", sql.NVarChar, nameUser)
    .input("code", sql.NVarChar, code).query(`
      SELECT dateExpiration FROM H2O.PASSWORD_RESET_CODES 
      WHERE nameUser = @nameUser AND code = @code
    `);

  if (result.recordset.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Código inválido.", data: {} });
  }

  const expiration = new Date(result.recordset[0].expiration);
  if (new Date() > expiration) {
    return res
      .status(410)
      .json({ success: false, message: "Código expirado.", data: {} });
  }

  return res
    .status(200)
    .json({ success: true, message: "Código válido.", data: {} });
};

export const resetPassword = async (req, res) => {
  const { nameUser, code, newPassword } = req.body;
  if (!nameUser || !code || !newPassword) {
    return res.status(400).json({ message: "Faltan datos requeridos." });
  }

  const pool = await getConnection();
  const result = await pool
    .request()
    .input("nameUser", sql.VarChar, nameUser)
    .input("code", sql.VarChar, code).query(`
      SELECT dateExpiration FROM H2O.PASSWORD_RESET_CODES 
      WHERE nameUser = @nameUser AND code = @code
    `);

  const expiration = new Date(result.recordset[0].expiration);
  if (new Date() > expiration) {
    return res
      .status(410)
      .json({
        success: false,
        message:
          "Ocurrio un error al cambiar la contraseña, solicita un nuevo código",
        data: {},
      });
  }

  // Actualizar contraseña
  await pool
    .request()
    .input("password", sql.NVarChar, newPassword)
    .input("nameUser", sql.NVarChar, nameUser)
    .query(
      "UPDATE H2O.USERS SET passwordUser = @password WHERE nameUser = @nameUser"
    );

  // Actualizar estado de código
  await pool
    .request()
    .input("nameUser", sql.VarChar, nameUser)
    .query(
      "UPDATE H2O.PASSWORD_RESET_CODES SET isUsed = 1 WHERE nameUser = @nameUser"
    );

  const dataEmail = { nameUser: nameUser };
  // Enviar correo
  await sendEmail(nameUser, "confirmation", dataEmail); // Implementa esta función

  res
    .status(200)
    .json({
      success: true,
      message: "Contraseña actualizada correctamente.",
      data: {},
    });
};
