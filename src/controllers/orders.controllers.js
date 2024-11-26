import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const createOrder = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("idClient", sql.Int, req.body.client)
    .input("idAddress", sql.Int, req.body.address)
    .input("total", sql.Decimal, req.body.total)
    .input("idTypePayment", sql.Int, req.body.typepayment)
    .query('INSERT INTO MIY_ORDERS ( idClient, dateOrder, idAddress, idStaff, total, idTypePayment) VALUES (@idClient, GETDATE() , @idAddress, 0, @total, @idTypePayment); SELECT SCOPE_IDENTITY() AS idOrder;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ message : "error could not add order"});
    }
    res.status(200).json({
        
        id : result.recordset[0].idCarShoping,
        client : req.body.client,
        product : req.body.product,
        quantity : req.body.quantity

    });
};


export const Product = async ( req, res) => {
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