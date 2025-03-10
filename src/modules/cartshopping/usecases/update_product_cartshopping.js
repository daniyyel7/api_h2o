import { updateCartProduct } from '../repositories/cartshopping.repository.js';

export const updateProduct = async (userId, productId, quantity) => {
    return await updateCartProduct(userId, productId, quantity);
};
