import { getConnection } from "../database/connection.js";
import sql from "mssql";


export const getAllImages = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .query("SELECT idCarouselImage AS id, urlImg FROM H2O.CAROUSEL_IMAGES WHERE idStatusImg = 1");
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
            success: false,
            message: "No hay imagenes",
            data: {},
        });
    }
    return res.json({
        success: true,
        message: "lista de imagenes",
        data: result.recordset,
    });
};


export const deleteImage = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .query(" UPDATE H2O.CAROUSEL_IMAGES SET idStatusImg = 0 WHERE idCarouselImage = @id ");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "imagen not found",
        data: {},
      });
    }
    return res.json({
      success: true,
      message: "imagen eliminada correctamente",
      data: {}
    });
  };

