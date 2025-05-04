import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const createComment = async (req, res) => {
  try {
    const pool = await getConnection();

    const { idUser, comment } = req.body;

    if (!idUser || !comment) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Faltan datos obligatorios.",
          data: {},
        });
    }

    const insertResult = await pool
      .request()
      .input("idUser", sql.Int, idUser)
      .input("comment", sql.NVarChar, comment).query(`
        INSERT INTO H2O.COMMENTS (idUser, comment) 
        VALUES (@idUser, @comment);
        `);

    return res.status(200).json({
      success: true,
      message: "Comentario creado correctamente",
      data: {
        mensaje: "Comentario enviado",
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error interno del servidor.",
        error: error.message,
      });
  }
};


export const getCommentsClient = async (req, res) => {
    try {
      const pool = await getConnection();
  
      const result = await pool
        .request()
        .query(` 
            SELECT 
             idComments,
  idUser,
  comment,
  CONVERT(VARCHAR(10), dateCreate, 23) AS dateCreate,
  isRead
            FROM H2O.COMMENTS 
            WHERE dateCreate >= DATEADD(DAY, -30, GETDATE())
            ORDER BY dateCreate ASC; `);
  
      return res.status(200).json({
        success: true,
        message: "Comentarios de los clientes",
        data: result.recordset,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error interno del servidor.",
          error: error.message,
        });
    }
};
  

export const getCommentsNotRead = async (req, res) => {
    try {
      const pool = await getConnection();
  
      const result = await pool
        .request()
        .query(` 
            SELECT
             idComments,
  idUser,
  comment,
  CONVERT(VARCHAR(10), dateCreate, 23) AS dateCreate,
  isRead
            FROM H2O.COMMENTS 
            WHERE dateCreate >= DATEADD(DAY, -30, GETDATE()) AND isRead = 0
            ORDER BY dateCreate ASC; `);
  
      return res.status(200).json({
        success: true,
        message: "Comentarios de los clientes",
        data: result.recordset,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error interno del servidor.",
          error: error.message,
        });
    }
};

export const getCommentsRead = async (req, res) => {
    try {
      const pool = await getConnection();
  
      const result = await pool
        .request()
        .query(` 
            SELECT 
             idComments,
  idUser,
  comment,
  CONVERT(VARCHAR(10), dateCreate, 23) AS dateCreate,
  isRead
            FROM H2O.COMMENTS 
            WHERE dateCreate >= DATEADD(DAY, -30, GETDATE()) AND isRead = 1
            ORDER BY dateCreate ASC; `);
  
      return res.status(200).json({
        success: true,
        message: "Comentarios de los clientes",
        data: result.recordset,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error interno del servidor.",
          error: error.message,
        });
    }
};


export const readComment = async (req, res) => {
    try {
      const pool = await getConnection();

      const idComment = req.params.idComment;

      console.log(idComment)
  
      const result = await pool
        .request()
        .input('idComment', sql.NVarChar, idComment)
        .query(` 
            UPDATE H2O.COMMENTS 
            SET isRead = 1
            WHERE idComments = @idComment 
            `);
  
      return res.status(200).json({
        success: true,
        message: "Comentarios actualizado como leido",
        data: {},
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Error interno del servidor.",
          error: error.message,
        });
    }
};
  