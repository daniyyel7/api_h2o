// services/productService.js
import * as productRepository from '../repositories/productRepository.js';

export const getPriceProduct = async (productId, userId) => {
    const result = await productRepository.getPriceByProductAndUser(productId, userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "type not found", data: null };
    }

    return { success: true, data: result.recordset[0] };
};

export const getProducts = async (userId) => {
    const result = await productRepository.getProductsByUserType(userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "type not found", data: [] };
    }

    return { success: true, data: result.recordset };
};

export const getCategories = async () => {
    const result = await productRepository.getAllCategories();

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "categories not found", data: [] };
    }

    return { success: true, data: result.recordset };
};

export const getProductsCategorie = async (categoryId, userId) => {
    const result = await productRepository.getProductsByCategoryAndUser(categoryId, userId);

    if (result.rowsAffected[0] === 0) {
        return { success: false, message: "products not found", data: [] };
    }

    return { success: true, data: result.recordset };
};
