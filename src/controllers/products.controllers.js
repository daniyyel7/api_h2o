import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const getPriceProduct = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("user", sql.Int, req.params.user)
    .query("SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM MIY_PRODUCTS P INNER JOIN MIY_PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN MIY_PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN MIY_USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idProduct = @id AND PP.idTypeUser = @user")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.json(result.recordset[0]);
};



export const getProducts = async (req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("user", sql.Int, req.params.user)
    .query(" SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM MIY_PRODUCTS P INNER JOIN MIY_PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN MIY_PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN MIY_USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idTypeUser = @user ")
    if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ message :"type not found" });
    }
    return res.json(result.recordset);
};