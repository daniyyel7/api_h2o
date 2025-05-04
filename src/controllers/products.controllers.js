import { getConnection } from "../database/connection.js";
import sql from "mssql";

export const createProduct = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("nameProduct", sql.VarChar, req.body.name)
    .input("descriptionProduct", sql.VarChar, req.body.description)
    .input("idCategorie", sql.VarChar, req.body.categorie)
    .input("urlImage", sql.VarChar, req.body.url)
    .query(
      "INSERT INTO H2O.PRODUCTS (nameProduct,descriptionProduct,idCategorie,urlImage) VALUES (@nameProduct, @descriptionProduct, @idCategorie, @urlImage); SELECT SCOPE_IDENTITY() AS idProduct;"
    );

  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "product is not created",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "product create",
    data: {
      idProduct: result.recordset[0].idProduct,
      name: req.body.name,
      description: req.body.description,
      categorie: req.body.categorie,
      url: req.body.url,
    },
  });
};

export const getInfoProduct = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.idProduct)
    .input("user", sql.Int, req.params.idTipoCliente)
    .query(
      "SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idProduct = @id AND PP.idTypeUser = @user"
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "price not found",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "price found",
    data: result.recordset[0],
  });
};

export const getProducts = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("user", sql.Int, req.params.user)
    .query(
      " SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE PP.idTypeUser = @user "
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "products not found",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "products found",
    data: result.recordset,
  });
};

export const getCategories = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query(
      "SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategoryStatus NOT LIKE 0  "
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "categorie not found",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "categorie found",
    data: result.recordset,
  });
};

export const getProductsCategorie = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("id", sql.Int, req.params.id)
    .input("user", sql.Int, req.params.user)
    .query(
      "SELECT P.idProduct, P.nameProduct, P.descriptionProduct, P.idCategorie, PC.nameCategorie, PP.price, P.urlImage FROM H2O.PRODUCTS P INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser WHERE P.idCategorie = @id AND PP.idTypeUser = @user"
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "type not found",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "",
    data: result.recordset,
  });
};

export const getAllProducts = async (req, res) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("user", sql.Int, req.params.user)
    .query(
      ` 
SELECT 
PP.idPrice, 
P.idProduct, 
P.nameProduct, 
P.descriptionProduct, 
P.idCategorie, 
PC.nameCategorie, 
PP.price, 
P.urlImage,
UT.nameType AS typeClient
FROM H2O.PRODUCTS P 
INNER JOIN H2O.PRODUCTS_PRICE PP ON P.idProduct = PP.idProduct 
INNER JOIN H2O.PRODUCTS_CATEGORIES PC ON P.idCategorie = PC.idCategorie 
INNER JOIN H2O.USERS_TYPE UT ON PP.idTypeUser = UT.idTypeUser
WHERE PP.idStatusPrice = 1
 `
    );
  if (result.rowsAffected[0] === 0) {
    return res.status(404).json({
      success: false,
      message: "products not found",
      data: {},
    });
  }
  return res.json({
    success: true,
    message: "products found",
    data: result.recordset,
  });
};

export const getProductsWithPrices = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        P.idProduct,
        P.nameProduct,
        P.idCategorie,
        P.descriptionProduct,
        P.urlImage,
        P.idStatusProduct,
        UT.idTypeUser,
        UT.nameType,
        ISNULL(PP.price, 0.00) AS price,
        ISNULL(PP.idStatusPrice, 0) AS idStatusPrice
      FROM H2O.PRODUCTS P
      CROSS JOIN H2O.USERS_TYPE UT
      LEFT JOIN H2O.PRODUCTS_PRICE PP
        ON P.idProduct = PP.idProduct AND UT.idTypeUser = PP.idTypeUser
      WHERE P.idStatusProduct = 1 AND UT.typeUser  IN ('PUBLIC', 'CUSTOM')
      ORDER BY P.idProduct, UT.idTypeUser
    `);

    // Organizar productos agrupados
    const products = {};

    result.recordset.forEach(row => {
      if (!products[row.idProduct]) {
        products[row.idProduct] = {
          idProduct: row.idProduct,
          idCategorie: row.idCategorie,
          nameProduct: row.nameProduct,
          descriptionProduct: row.descriptionProduct,
          urlImage: row.urlImage,
          idStatusProduct: row.idStatusProduct,
          prices: []
        };
      }
      products[row.idProduct].prices.push({
        idTypeUser: row.idTypeUser,
        nameType: row.nameType,
        price: parseFloat(row.price),
        idStatusPrice: row.idStatusPrice
      });
    });

    res.status(200).json({
      success: true,
      data: Object.values(products)
    });
  } catch (error) {
    console.error("Error al obtener lista de productos con precios:", error);
    res.status(500).json({ success: false, message: "Error al obtener productos", error: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { idProduct } = req.params;

    if (!idProduct) {
      return res.status(400).json({ success: false, message: "Falta el campo requerido: idProduct." });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("idProduct", sql.Int, idProduct)
      .query("UPDATE H2O.PRODUCTS SET idStatusProduct = 0 WHERE idProduct = @idProduct");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Producto no encontrado." });
    }

    res.status(200).json({
      success: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ success: false, message: "Error interno al eliminar producto", error: error.message });
  }
};


export const upsertProductPrice = async (req, res) => {
  try {
    const { idProduct, idTypeUser, price, idStatusPrice } = req.body;

    if (!idProduct || !idTypeUser || price === undefined || !idStatusPrice) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos: idProduct, idTypeUser, price y idProductStatus." });
    }

    const pool = await getConnection();

    // Primero, verificar si ya existe el precio
    const checkResult = await pool.request()
      .input("idProduct", sql.Int, idProduct)
      .input("idTypeUser", sql.Int, idTypeUser)
      .query(`
        SELECT idPrice 
        FROM H2O.PRODUCTS_PRICE
        WHERE idProduct = @idProduct AND idTypeUser = @idTypeUser
      `);

    if (checkResult.recordset.length > 0) {
      // Si existe, actualizar precio y status
      await pool.request()
        .input("idProduct", sql.Int, idProduct)
        .input("idTypeUser", sql.Int, idTypeUser)
        .input("price", sql.Decimal(10, 2), price)
        .input("idStatusPrice", sql.Int, idStatusPrice)
        .query(`
          UPDATE H2O.PRODUCTS_PRICE
          SET price = @price, idStatusPrice = @idStatusPrice
          WHERE idProduct = @idProduct AND idTypeUser = @idTypeUser
        `);

      return res.status(200).json({ success: true, message: "Precio y estatus actualizados correctamente." });

    } else {
      // Si no existe, insertar nuevo precio
      await pool.request()
        .input("idProduct", sql.Int, idProduct)
        .input("idTypeUser", sql.Int, idTypeUser)
        .input("price", sql.Decimal(10, 2), price)
        .input("idStatusPrice", sql.Int, idStatusPrice)
        .query(`
          INSERT INTO H2O.PRODUCTS_PRICE (idProduct, idTypeUser, price, idStatusPrice)
          VALUES (@idProduct, @idTypeUser, @price, @idStatusPrice)
        `);

      return res.status(201).json({ success: true, message: "Precio y estatus insertados correctamente." });
    }
    
  } catch (error) {
    console.error("Error al actualizar o insertar precio:", error);
    res.status(500).json({ success: false, message: "Error interno al actualizar o insertar precio", error: error.message });
  }
};

