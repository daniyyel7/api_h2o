import * as cartRepo from '../repositories/cartshopping.repository.js';

export const addProductToCart = async (req, res) => {
    const response = await cartRepo.addProductToCart(req.body.client, req.body.product, req.body.quantity);
    return res.status(response.success ? 200 : 500).json(response);
};

export const updateCartProduct = async (req, res) => {
    const response = await cartRepo.updateCartProduct(req.params.id, req.body.quantity, req.body.status);
    return res.status(response.success ? 201 : 404).json(response);
};

export const productsCart = async (req, res) => {
    const response = await cartRepo.productsCart(req.params.id);
    return res.status(response.success ? 200 : 404).json(response);
};
