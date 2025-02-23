import {getConnection} from '../database/connection.js';
import sql from 'mssql'


export const addProduct = async( req, res) => {
    const pool = await getConnection();
    const result = await pool
    .request()
    .input("client", sql.Int, req.body.client)
    .input("product", sql.Int, req.body.product)
    .input("quantity", sql.Int, req.body.quantity)
    .query('INSERT INTO H2O.CART_SHOPPING (idClient, idProduct, quantity, idStatusProductCar) VALUES (@client, @product, @quantity, 1 ); SELECT SCOPE_IDENTITY() AS idCarShoping;');
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ 
            success: true,
            message : "error could not add product",
            data: "",
        });
    }
    res.status(200).json({
        success:true,
        message : "add product",
        data:{
            id : result.recordset[0].idCarShoping,
            client : req.body.client,
            product : req.body.product,
            quantity : req.body.quantity,
        },
    });
};

export const updateCarProduct = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("quantity", sql.Int, req.body.quantity)
    .input("status", sql.Int, req.body.status)
    .query("UPDATE H2O.CART_SHOPPING SET quantity = @quantity, idStatusProductCar = @status WHERE idCarShoping = @id");
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ 
            success: false,
            message : "product not found not updated",
            data: "",
        });
    }
    return res.status(201).json({ 
        success: true,
        message : "product updated",
        data:{
            id : req.params.id, 
            quantity : req.body.quantity, 
            status : req.body.status,
        },
    });
};

export const productsCart = async ( req, res) => {
    const pool = await getConnection()
    const result = await pool
    .request()
    .input("idClient", sql.Int, req.params.id)
    .query(`
        SELECT 
            MCS.idProduct, 
            MCS.quantity, 
            PPT.price AS priceProduct
        FROM H2O.CART_SHOPPING MCS
        INNER JOIN (
            SELECT * FROM H2O.PRODUCTS_PRICE 
            WHERE idTypeUser = (
                SELECT MUT.idTypeUser 
                FROM H2O.CLIENTS_DATA MCD
                INNER JOIN H2O.USERS MU ON MCD.idUser = MU.idUser
                INNER JOIN H2O.USERS_TYPE MUT ON MU.idTypeUser = MUT.idTypeUser
                WHERE MCD.idClient = @idClient
            )
        ) PPT ON MCS.idProduct = PPT.idProduct
        WHERE MCS.idClient = @idClient 
          AND MCS.idStatusProductCar = 1;
    `);
    if( result.rowsAffected[0] === 0){
        return res.status(404).json({ 
            success: false,
            message : "products not found",
            data: "",
        });
    }

    const products = result.recordset.map(product => ({
        ...product,
        subtotal: product.quantity * product.priceProduct
    }));

    const total = products.reduce((acc, product) => acc + product.subtotal, 0);

    
    return res.json({
        success: true,
        message: "Lista de productos en el carrito",
        data: {
            products,
            total
        }
    });
    
};