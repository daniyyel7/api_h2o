import { getConnection } from "../database/connection.js";
import sql from "mssql";


export const createCategory = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, req.body.name)
    .input("urlImg", sql.VarChar, req.body.urlImg)
    .query(
        "INSERT INTO H2O.PRODUCTS_CATEGORIES (nameCategorie, urlImage, idCategoryStatus) VALUES (@name, @urlImg, 1); SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategorie = SCOPE_IDENTITY() ;"
    );
    
    if (result.rowsAffected[0] === 0) {        return res.status(404).json({
            success: false,
            message: "category is not created",
            data: {},
        });
    }
    return res.json({
        success: true,
        message: "category create",
        data: {
            idCategorie: result.recordset[0].idCategorie,
            name: result.recordset[0].nameCategorie,
            urlImg: result.recordset[0].urlImage,
            status: result.recordset[0].idCategoryStatus,
        },
    });
};


export const getCategories = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .query("SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategoryStatus = 1 ");
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
            success: false,
            message: "categorie not found",
            data: {},
        });
    }
    return res.json({
        success: true,
        message: "categorie found",
        data: result.recordset,
    });
};



export const updateCategory = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("idCategorie", sql.Int, req.params.id)
    .input("nameCategorie", sql.VarChar, req.body.name)
    .input("urlImage", sql.VarChar, req.body.urlImg)
    .input("idCategoryStatus", sql.Int, req.body.idStatus)
    .query("UPDATE H2O.PRODUCTS_CATEGORIES SET nameCategorie = @nameCategorie, urlImage = @urlImage, idCategoryStatus = @idCategoryStatus WHERE idCategorie = @idCategorie; SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategorie = @idCategorie");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "categorie not found",
        data: {},
      });
    }
    return res.json({
      success: true,
      message: "categorie actualizada",
      data: result.recordset,
    });
  };

  export const deleteCategory = async (req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("idCategorie", sql.Int, req.params.id)
    .query("UPDATE H2O.PRODUCTS_CATEGORIES SET  idCategoryStatus = 0 WHERE idCategorie = @idCategorie; SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategorie = @idCategorie");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: "categorie not found",
        data: {},
      });
    }
    return res.json({
      success: true,
      message: "categorie eliminada",
      data: {},
    });
  };