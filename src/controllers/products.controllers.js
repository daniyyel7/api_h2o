import * as productService from '../services/productsService.js';


// Obteter el precio de un producto
export const getPriceProduct = async (req, res) => {
    try {
        const { id, user } = req.params;
        const response = await productService.getPriceProduct(parseInt(id), parseInt(user));

        if (!response.success) {
            return res.status(404).json({ message: response.message });
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error en el servicce-getPriceProduct:', error);
        return res.status(500).json({ message: 'Error del servicio' });
    }
};

// Obtener todos los productos
export const getProducts = async (req, res) => {
    try {
        const { user } = req.params;
        const response = await productService.getProducts(parseInt(user));

        if (!response.success) {
            return res.status(404).json({ message: response.message });
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error en el service-getProducts:', error);
        return res.status(500).json({ message: 'Error del servicio' });
    }
};

// Obtener todas las categorías
export const getCategories = async (req, res) => {
    try {
        const response = await productService.getCategories();

        if (!response.success) {
            return res.status(404).json({ message: response.message });
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error en getCategories:', error);
        return res.status(500).json({ message: 'Error del servicio' });
    }
};

// Obtener productos por categoría y tipo de usuario
export const getProductsCategorie = async (req, res) => {
    try {
        const { id, user } = req.params;
        const response = await productService.getProductsCategorie(parseInt(id), parseInt(user));

        if (!response.success) {
            return res.status(404).json({ message: response.message });
        }

        return res.json(response.data);
    } catch (error) {
        console.error('Error en getProductsCategorie:', error);
        return res.status(500).json({ message: 'Error del servicio' });
    }
};









// import {getConnection} from '../database/connection.js';
// import sql from 'mssql'

 
// export const getPriceProduct = async (req, res) => {
//     const pool = await getConnection()
//     const result = await pool
//     .request()
//     .input("id", sql.Int, req.params.id)
//     .input("user", sql.Int, req.params.user)
//     .query("SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idProduct = @id AND PP.idTypeUser = @user")
//     if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ message :"type not found" });
//     }
//     return res.json(result.recordset[0]);
// };



// export const getProducts = async (req, res) => {
//     const pool = await getConnection()
//     const result = await pool
//     .request()
//     .input("user", sql.Int, req.params.user)
//     .query(" SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idTypeUser = @user ")
//     if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ message :"type not found" });
//     }
//     return res.json(result.recordset);
// };

// export const getCategories = async (req, res) => {
//     const pool = await getConnection()
//     const result = await pool
//     .request()
//     .query(" SELECT * FROM H2O.PRODUCTS_CATEGORIES ")
//     if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ message :"type not found" });
//     }
//     return res.json(result.recordset);
// };


// export const getProductsCategorie = async (req, res) => {
//     const pool = await getConnection()
//     const result = await pool
//     .request()
//     .input("id", sql.Int, req.params.id)
//     .input("user", sql.Int, req.params.user)
//     .query("SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE P.idCategorie = @id AND PP.idTypeUser = @user")
//     if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ message :"type not found" });
//     }
//     return res.json(result.recordset);
// };
