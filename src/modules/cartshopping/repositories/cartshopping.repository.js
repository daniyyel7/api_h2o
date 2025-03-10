import { getConnection } from '../../../database/connection.js';
import sql from 'mssql';

export const addProductToCart = async (userId, productId, quantity) => {
    const pool = await getConnection();
    return await pool.request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .query("INSERT INTO H2O.CART (userId, productId, quantity) VALUES (@userId, @productId, @quantity);");
};

export const updateCartProduct = async (userId, productId, quantity) => {
    const pool = await getConnection();
    return await pool.request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .query("UPDATE H2O.CART SET quantity = @quantity WHERE userId = @userId AND productId = @productId;");
};

export const getCartProducts = async (userId) => {
    const pool = await getConnection();
    return await pool.request()
        .input("userId", sql.Int, userId)
        .query("SELECT C.productId, P.nameProduct, C.quantity, P.price FROM H2O.CART C INNER JOIN H2O.PRODUCTS P ON C.productId = P.idProduct WHERE C.userId = @userId;");
};
