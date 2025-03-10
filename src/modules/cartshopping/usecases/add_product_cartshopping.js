import { addProductToCart } from '../repositories/cartshopping.repository.js';

export const addProduct = async (userId, productId, quantity) => {
    return await addProductToCart(userId, productId, quantity);
};