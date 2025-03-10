import { addProduct } from '../usecases/add_product_cartshopping.js';
import { updateProduct } from '../usecases/update_product_cartshopping.jss';
import { fetchCartProducts } from '../usecases/get_cartshopping.js';

export const addProductController = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        await addProduct(userId, productId, quantity);
        res.json({ success: true, message: "Product added to cart" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProductController = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        await updateProduct(userId, productId, quantity);
        res.json({ success: true, message: "Cart updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCartProductsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const products = await fetchCartProducts(userId);
        res.json({ success: true, data: products.recordset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};