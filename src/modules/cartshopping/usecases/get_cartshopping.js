import { getCartProducts } from '../repositories/cartshopping.repository.js';

export const fetchCartProducts = async (userId) => {
    return await getCartProducts(userId);
};