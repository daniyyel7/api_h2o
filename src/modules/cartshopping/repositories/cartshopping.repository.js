import { getConnection } from '../../../database/connection.js';
import sql from 'mssql';

export const addProductToCart = async (client, product, quantity) => {
    const pool = await getConnection();

    // Verifica si el producto ya está en el carrito del cliente
    const exist = await pool
        .request()
        .input("client", sql.Int, client)
        .input("product", sql.Int, product)
        .query(`
            SELECT idCarShoping, quantity 
            FROM H2O.CART_SHOPPING 
            WHERE idClient = @client 
            AND idProduct = @product 
            AND idStatusProductCar = 1
        `);

    if (exist.recordset.length > 0) {
        const newQuantity = exist.recordset[0].quantity + quantity;
        await pool
            .request()
            .input("quantity", sql.Int, newQuantity)
            .input("idCarShopping", sql.Int, exist.recordset[0].idCarShoping)
            .query(`
                UPDATE H2O.CART_SHOPPING 
                SET quantity = @quantity 
                WHERE idCarShoping = @idCarShopping
            `);

        return {
            success: true,
            message: "Cantidad actualizada correctamente",
            data: {
                id: exist.recordset[0].idCarShoping,
                client,
                product,
                quantity: newQuantity,
            },
        };
    } else {
        // Inserta el producto en el carrito
        const result = await pool
            .request()
            .input("client", sql.Int, client)
            .input("product", sql.Int, product)
            .input("quantity", sql.Int, quantity)
            .query(`
                INSERT INTO H2O.CART_SHOPPING (idClient, idProduct, quantity, idStatusProductCar) 
                VALUES (@client, @product, @quantity, 1); 
                SELECT SCOPE_IDENTITY() AS idCarShopping;
            `);

        if (result.recordset.length === 0) {
            return {
                success: false,
                message: "Error: No se pudo añadir el producto al carrito",
                data: null,
            };
        }

        return {
            success: true,
            message: "Producto agregado al carrito de manera exitosa",
            data: {
                id: result.recordset[0].idCarShopping,
                client,
                product,
                quantity,
            },
        };
    }
};

export const updateCartProduct = async (id, quantity, status) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("quantity", sql.Int, quantity)
        .input("status", sql.Int, status)
        .query(`
            UPDATE H2O.CART_SHOPPING 
            SET quantity = @quantity, idStatusProductCar = @status 
            WHERE idCarShoping = @id
        `);

    return result.rowsAffected[0] > 0
        ? {
              success: true,
              message: "Producto actualizado",
              data: { id, quantity, status },
          }
        : {
              success: false,
              message: "Product no actualizado o no encontrado",
              data: "",
          };
};

export const productsCart = async (idClient) => {
    const pool = await getConnection();
    const result = await pool
        .request()
        .input("idClient", sql.Int, idClient)
        .query(`
            SELECT MCS.idProduct, MCS.quantity, PPT.price AS priceProduct 
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

    if (result.recordset.length === 0) {
        return {
            success: false,
            message: "Productos no encontrados",
            data: "",
        };
    }

    const products = result.recordset.map((product) => ({
        ...product,
        subtotal: product.quantity * product.priceProduct,
    }));

    const total = products.reduce((acc, product) => acc + product.subtotal, 0);

    return {
        success: true,
        message: "Lista de productos en el carrito",
        data: { products, total },
    };
};
