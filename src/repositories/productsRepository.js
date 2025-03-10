// repositories/productRepository.js
import { getConnection } from '../database/connection.js';
import sql from 'mssql';

// Obtener precio de un producto para un usuario
export const getPriceByProductAndUser = async (productId, userId) => {
    const pool = await getConnection();
    return await pool.request()
        .input("id", sql.Int, productId)
        .input("user", sql.Int, userId)
        .query(`
            SELECT P.idProduct, P.nameProduct, P.descriptionProduct, 
                   P.idCategorie, PC.nameCategorie, PP.price, P.urlImage
            FROM H2O.PRODUCTS P
            INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct
            INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie
            INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser
            WHERE PP.idProduct = @id AND PP.idTypeUser = @user
        `);
};

// Obtener todos los productos para un usuario
export const getProductsByUserType = async (userId) => {
    const pool = await getConnection();
    return await pool.request()
        .input("user", sql.Int, userId)
        .query(`
            SELECT P.idProduct, P.nameProduct, P.descriptionProduct, 
                   P.idCategorie, PC.nameCategorie, PP.price, P.urlImage
            FROM H2O.PRODUCTS P
            INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct
            INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie
            INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser
            WHERE PP.idTypeUser = @user
        `);
};

// Obtener todas las categorías
export const getAllCategories = async () => {
    const pool = await getConnection();
    return await pool.request()
        .query("SELECT * FROM H2O.PRODUCTS_CATEGORIES");
};

// Obtener productos por categoría y tipo de usuario
export const getProductsByCategoryAndUser = async (categoryId, userId) => {
    const pool = await getConnection();
    return await pool.request()
        .input("id", sql.Int, categoryId)
        .input("user", sql.Int, userId)
        .query(`
            SELECT P.idProduct, P.nameProduct, P.descriptionProduct, 
                   P.idCategorie, PC.nameCategorie, PP.price, P.urlImage
            FROM H2O.PRODUCTS P
            INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct
            INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie
            INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser
            WHERE P.idCategorie = @id AND PP.idTypeUser = @user
        `);
};
