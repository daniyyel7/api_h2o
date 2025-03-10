// Importaciones
import * as productRepository from '../repositories/productsRepository';
import { getPriceProductModel } from '../models/getPriceProductModels';
import { getProductsMoldel } from '../models/getProductsModels';
import { getCategoriesModel } from '../models/getCategoriesModel';
import { getProductsCategorieModel } from '../models/getProductsCategorieModel';


// Obeter el precio de un producto
export const getPriceProduct = async (productId, userId) => {
    const result = await productRepository.getPriceProduct(productId, userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "No se encontro el precio del producto", data: null };
    }

    //return { success: true, data: result.recordset[0] };
    const productData = result.recordset[0]; // DB
    const product = new getPriceProductModel(productData); //aquí usa el modelo

    return product;
};

// Obtener todos los productos
export const getProducts = async (userId) => {
    const result = await productRepository.getProducts(userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "No se encontraron productos", data: [] };
    }

    //return { success: true, data: result.recordset };
    const products = result.recordset.map(product => new getProductsMoldel(product));

    return products;
};

// Obtener todas las categorías
export const getCategories = async () => {
    const result = await productRepository.getCategories();

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "No se encontraron categorias", data: [] };
    }

    // return { success: true, data: result.recordset };
    const categories = result.recordset.map(category => new getCategoriesModel(category));

    return categories;
};

// Obtener productos por categoría y tipo de usuario
export const getProductsCategorie = async (categoryId, userId) => {
    const result = await productRepository.getProductsCategorie(categoryId, userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "No se encontraron productos en la categoria", data: [] };
    }

    // return { success: true, data: result.recordset };
    const products = result.recordset.map(product => new getProductsCategorieModel(product));

    return products;
};
