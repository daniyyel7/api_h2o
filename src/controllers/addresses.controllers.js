import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const createAdresses = async (req, res) => {
  console.log(req.body.latitude);

  const pool = await getConnection();
  const address = await pool
    .request()
    .input("idClient", sql.Int, req.body.idClient)
    .input("street", sql.NVarChar, req.body.street)
    .input("outerNumber", sql.NVarChar, req.body.outerNumber)
    .input("insideNumber", sql.NVarChar, req.body.insideNumber)
    .input("idZipCode", sql.Int, req.body.idZipCode)
    .input("latitude", sql.NVarChar, req.body.latitude.toFixed(6))
    .input("longitude", sql.NVarChar, req.body.longitude.toFixed(6))
    .input("descriptionAddress", sql.NVarChar, req.body.description)
    .input("nombre", sql.NVarChar, req.body.nombre)
    .input("telefono", sql.NVarChar, req.body.telefono)
    .input("observaciones", sql.NVarChar, req.body.observaciones)
    .execute(`H2O.STP_CREATE_ADDRESSE`);
  console.log(address.recordset);

  return res.status(201).json({
    success: true,
    message: "addresses added successfully.",
    data: {
      idAddress: address.recordset[0].idAddress,
      descripcion: address.recordset[0].descripcion,
      nombre: address.recordset[0].nombre,
      street: address.recordset[0].street,
      outerNumber: address.recordset[0].outerNumber,
      insideNumber: address.recordset[0].insideNumber,
      ciudad: address.recordset[0].ciudad,
      colonia: address.recordset[0].colonia,
      estado: address.recordset[0].estado,
      zipCode: address.recordset[0].zipCode,
      latitude: address.recordset[0].latitude,
      longitude: address.recordset[0].longitude,
      pais: address.recordset[0].pais,
      telefono: address.recordset[0].telefono,
      observaciones: address.recordset[0].observaciones,
    },
  });
};

export const addressesByClient = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().input("id", sql.Int, req.params.id)
    .query(`SELECT
CA.idAddress,
CA.descriptionAddress AS descripcion,
CA.nombre,
CA.street,
CA.outerNumber,
CA.insideNumber, 
ZC.ciudad,
ZC.colonia,
ZC.estado,
ZC.zipCode,
CA.latitude,
CA.longitude,
ZC.pais,
CA.telefono,
CA.observaciones
FROM H2O.CLIENTS_ADREESSES CA
INNER JOIN H2O.ZIP_CODE ZC ON CA.idZipCode = ZC.idZipCode
WHERE idClient = @id AND idStatusAddress = 1`);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "addres not found not found",
      data: {},
    });
  }
  return res.status(201).json({
    success: true,
    message: "address por cliente",
    data: result.recordset,
  });
};

export const allZipCode = async (req, res) => {
  const pool = await getConnection();
  const result = await pool.request().query("SELECT * FROM H2O.ZIP_CODE");

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "zipcode not found",
      data: {},
    });
  }

  const zipCodes = result.recordset;

  return res.json({
    success: true,
    message: "Lista de codigos postales",
    data: {
      zipCodes,
    },
  });
};

export const updateAddress = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("idAddress", sql.NVarChar, req.params.idAddress)
    .input("descriptionAddress", sql.NVarChar, req.body.description)
    .input("nombre", sql.NVarChar, req.body.nombre)
    .input("street", sql.NVarChar, req.body.street)
    .input("outerNumber", sql.NVarChar, req.body.outerNumber)
    .input("insideNumber", sql.NVarChar, req.body.insideNumber)
    .input("idZipCode", sql.Int, req.body.idZipCode)
    .input("latitude", sql.NVarChar, req.body.latitude.toFixed(6))
    .input("longitude", sql.NVarChar, req.body.longitude.toFixed(6))
    .input("telefono", sql.NVarChar, req.body.telefono)
    .input("observaciones", sql.NVarChar, req.body.observaciones)
    .query(`UPDATE H2O.CLIENTS_ADREESSES
SET
descriptionAddress = @descriptionAddress,
nombre = @nombre,
street = @street,
outerNumber = @outerNumber,
insideNumber = @insideNumber, 
idZipCode = @idZipCode,
latitude = @latitude,
longitude = @longitude,
telefono = @telefono,
observaciones = @observaciones
WHERE idAddress = @idAddress`);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "addres not found not found",
      data: {},
    });
  }

  const result2 = await pool
    .request()
    .input("idAddress", sql.NVarChar, req.params.idAddress).query(`SELECT
CA.idAddress,
CA.descriptionAddress AS descripcion,
CA.nombre,
CA.street,
CA.outerNumber,
CA.insideNumber, 
ZC.ciudad,
ZC.colonia,
ZC.estado,
ZC.zipCode,
CA.latitude,
CA.longitude,
ZC.pais,
CA.telefono,
CA.observaciones
FROM H2O.CLIENTS_ADREESSES CA
INNER JOIN H2O.ZIP_CODE ZC ON CA.idZipCode = ZC.idZipCode
WHERE idAddress = @idAddress`);

  return res.status(201).json({
    success: true,
    message: "address update",
    data: result2.recordset[0],
  });
};

export const deleteAddress = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("idAddress", sql.Int, req.params.idAddress)
    .query(`UPDATE H2O.CLIENTS_ADREESSES
SET
idStatusAddress = 3
WHERE idAddress = @idAddress`);

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "addres not found",
      data: {},
    });
  }
  return res.status(201).json({
    success: true,
    message: "address eliminada",
    data: {},
  });
};
