import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const addProduct = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("client", sql.Int, req.body.client)
    .input("product", sql.Int, req.body.product)
    .input("quantity", sql.Int, req.body.quantity)
    .query('INSERT INTO MIY_CART_SHOPPING (idClient, idProduct, quantity, idStatusProductCar) VALUES (@client, @product, @quantity, 1 ); SELECT SCOPE_IDENTITY() AS idCarShoping;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not add product"});
    }
    res.status(200).json({
        message : "add product",
        id : result.recordset[0].idCarShoping,
        client : req.body.client,
        product : req.body.product,
        quantity : req.body.quantity
    });
};


export const updateCarProduct = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("quantity", sql.Int, req.body.quantity)
    .input("status", sql.Int, req.body.status)
    .query("UPDATE MIY_CART_SHOPPING SET quantity = @quantity, idStatusProductCar = @status WHERE idCarShoping = @id");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "product not found not updated"});
    }
    return res.status(201).json({ 
        message : "product updated",
        id : req.params.id, 
        quantity : req.body.quantity, 
        status : req.body.status 
    });
};