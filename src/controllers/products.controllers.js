import {getConnection} from '../database/connection.js';
import sql from 'mssql'

export const createProduct = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("nameProduct", sql.VarChar, req.body.name)
    .input("descriptionProduct", sql.VarChar, req.body.description)
    .input("idCategorie", sql.VarChar, req.body.categorie)
    .input("urlImage", sql.VarChar, req.body.url)
    .query('INSERT INTO H2O.PRODUCTS (nameProduct,descriptionProduct,idCategorie,urlImage) VALUES (@nameProduct, @descriptionProduct, @idCategorie, @urlImage); SELECT SCOPE_IDENTITY() AS idProduct;');

    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
            success: false,
            message :"product is not created" ,
            data: {},
        });
    }
    return res.json({
        success: true,
        message: "product create",
        data :
            {
            idProduct:result.recordset[0].idProduct,
            name: req.body.name,
            description: req.body.description,
            categorie: req.body.categorie,
            url: req.body.url,
            }
    });


};

export const getInfoProduct = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.idProduct)
    .input("user", sql.Int, req.params.idTipoCliente)
    .query("SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idProduct = @id AND PP.idTypeUser = @user")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
            success: false,
            message :"price not found",
            data: {},
        });
    }
    return res.json({
        success: true,
        message :"price found",
        data: result.recordset[0],
    });
};



export const getProducts = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("user", sql.Int, req.params.user)
    .query(" SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idTypeUser = @user ")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
            success: false,
            message :"products not found",
            data: {},
        });
    }
    return res.json(
        {
            success: true,
            message :"products found",
            data: result.recordset,
        });
};

export const getCategories = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .query("SELECT * FROM H2O.PRODUCTS_CATEGORIES ")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
            success: false,
            message :"categorie not found",
            data: {},
         });
    }
    return res.json(
        {
            success: true,
            message: "categorie found",
            data:result.recordset,
        }
    );
};


export const getProductsCategorie = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("user", sql.Int, req.params.user)
    .query("SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE P.idCategorie = @id AND PP.idTypeUser = @user")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
            success: false,
            message :"type not found",
            data: {},
         });
    }
    return res.json(
        {
            success: true,
            message: "",
            data: result.recordset,

        }
    );
};
