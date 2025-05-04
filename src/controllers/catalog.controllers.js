import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const getActiveCategories = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query(`
        SELECT idCategorie, nameCategorie
        FROM H2O.PRODUCTS_CATEGORIES
        WHERE idCategoryStatus = 1
      `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error al obtener categorías activas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categorías activas",
      error: error.message,
    });
  }
};


export const getClientCustom = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .query(`
        SELECT 
        idTypeUser,
        nameType
        FROM H2O.USERS_TYPE 
        WHERE idStatusType = 1 AND typeUser = 'CUSTOM'
      `);

    res.status(200).json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error al obtener los tipos de clientes custom", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categorías activas",
      error: error.message,
    });
  }
};