import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { getConnection } from "../database/connection.js";
import sql from "mssql";

// Extensiones válidas
const allowedExtensions = [".jpg", ".jpeg", ".png"];

// Almacenamiento temporal para todas las imágenes
const tmpStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/img/tmp");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().replaceAll(" ", "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Middleware Multer genérico
export const uploadImage = multer({
  storage: tmpStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Tipo de archivo no permitido (.jpg, .jpeg, .png)"), false);
    }
    cb(null, true);
  },
}).single("myFile");

// Función única para procesar y mover imagen
export const processImage = async (tempPath, folder, filename) => {
  const finalPath = `src/public/img/${folder}/${filename}`;

  await sharp(tempPath)
    .resize(350, 350, { fit: "inside" })
    .jpeg({ quality: 60 })
    .toFile(finalPath);

  fs.unlinkSync(tempPath); // Elimina la imagen temporal

  return `http://h2o.isdapps.uk/public/img/${folder}/${filename}`;
};

//  Subir categoría
export const uploadCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "El campo 'name' es obligatorio.",
      });
    }

    const folder = "categories";
    const imageName = req.file?.filename?.replaceAll(" ", "_");

    // Si no hay imagen, usar imagen por defecto
    const urlImg = imageName
      ? `http://h2o.isdapps.uk/public/img/${folder}/${imageName}`
      : `http://h2o.isdapps.uk/public/img/${folder}/default.png`; // ⚠️ Asegúrate de tener esta imagen

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("urlImg", sql.VarChar, urlImg)
      .query(
        `INSERT INTO H2O.PRODUCTS_CATEGORIES (nameCategorie, urlImage, idCategoryStatus)
         VALUES (@name, @urlImg, 1);
         SELECT * FROM H2O.PRODUCTS_CATEGORIES WHERE idCategorie = SCOPE_IDENTITY();`
      );

    res.status(200).json({
      success: true,
      message: "Categoría creada correctamente",
      data: {
        id: result.recordset[0].idCategorie,
        name: result.recordset[0].nameCategorie,
        urlImg: result.recordset[0].urlImage,
      },
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

// Subir avatar
export const uploadAvatar = async (req, res) => {
  const folder = "avatars";
  const idUser = req.body.idUser;

  let urlImg;

  try {
    // Si hay archivo, procesamos y obtenemos URL final
    if (req.file) {
      const filename = req.file.filename;
      const tempPath = req.file.path;
      urlImg = await processImage(tempPath, folder, filename);
    } else {
      // Si no hay archivo, usamos una imagen por defecto
      urlImg = `http://h2o.isdapps.uk/public/img/${folder}/default.jpg`;
    }

    const pool = await getConnection();
    const userCheck = await pool.request()
      .input("idUser", sql.Int, idUser)
      .query(`SELECT * FROM
        (SELECT idUser, urlPhotoClient AS urlPhoto, typeUser = 'CLIENTE' FROM H2O.CLIENTS_DATA
         UNION
         SELECT idUser, urlPhotoStaff AS urlPhoto, typeUser = 'STAFF' FROM H2O.STAFF_COMPANY) AS UTU
       WHERE UTU.idUser = @idUser`);

    if (userCheck.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const type = userCheck.recordset[0].typeUser;
    let query = "";

    if (type === "CLIENTE") {
      query = `
        UPDATE H2O.CLIENTS_DATA SET urlPhotoClient = @urlImg WHERE idUser = @idUser;
        SELECT idUser, urlPhotoClient AS urlImg FROM H2O.CLIENTS_DATA WHERE idUser = @idUser;
      `;
    } else {
      query = `
        UPDATE H2O.STAFF_COMPANY SET urlPhotoStaff = @urlImg WHERE idUser = @idUser;
        SELECT idUser, urlPhotoStaff AS urlImg FROM H2O.STAFF_COMPANY WHERE idUser = @idUser;
      `;
    }

    const result = await pool.request()
      .input("idUser", sql.Int, idUser)
      .input("urlImg", sql.VarChar, urlImg)
      .query(query);

    res.status(200).json({
      success: true,
      message: req.file
        ? "Avatar subido y optimizado correctamente"
        : "Avatar predeterminado asignado correctamente",
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al procesar avatar", error: err.message });
  }
};

// 🛠️ Actualizar categoría (con nueva imagen opcional)
export const uploadUpdateCategory = async (req, res) => {
  try {
    const { idCategorie, name } = req.body;

    if (!idCategorie || !name) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos: idCategorie o name." });
    }

    const folder = "categories";
    let urlImg = null;

    if (req.file) {
      const filename = req.file.filename;
      const tempPath = req.file.path;
      urlImg = await processImage(tempPath, folder, filename);
    }

    const pool = await getConnection();
    const request = pool.request()
      .input("idCategorie", sql.Int, idCategorie)
      .input("name", sql.VarChar, name);

    if (urlImg) {
      request.input("urlImg", sql.VarChar, urlImg);
    }

    const query = urlImg
      ? `UPDATE H2O.PRODUCTS_CATEGORIES SET nameCategorie = @name, urlImage = @urlImg WHERE idCategorie = @idCategorie;`
      : `UPDATE H2O.PRODUCTS_CATEGORIES SET nameCategorie = @name WHERE idCategorie = @idCategorie;`;

    await request.query(query);

    const result = await pool.request()
      .input("idCategorie", sql.Int, idCategorie)
      .query(`SELECT idCategorie, nameCategorie, urlImage FROM H2O.PRODUCTS_CATEGORIES WHERE idCategorie = @idCategorie`);

    res.status(200).json({
      success: true,
      message: "Categoría actualizada correctamente",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error al actualizar la categoría:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la categoría", error: error.message });
  }
};

// Actualizar avatar (con nueva imagen opcional o imagen por defecto)
export const uploadUpdateAvatar = async (req, res) => {
  try {
    const { idUser } = req.body;

    if (!idUser) {
      return res.status(400).json({ success: false, message: "Falta el campo requerido: idUser." });
    }

    const folder = "avatars";
    let urlImg;

    // Procesar nueva imagen si se sube
    if (req.file) {
      const filename = req.file.filename;
      const tempPath = req.file.path;
      urlImg = await processImage(tempPath, folder, filename);
    } else {
      // Asignar avatar por defecto si no se sube imagen
      urlImg = `http://h2o.isdapps.uk/public/img/${folder}/default.jpg`;
    }

    const pool = await getConnection();

    const userCheck = await pool.request()
      .input("idUser", sql.Int, idUser)
      .query(`SELECT * FROM
        (SELECT idUser, urlPhotoClient AS urlPhoto, typeUser = 'CLIENTE' FROM H2O.CLIENTS_DATA
         UNION
         SELECT idUser, urlPhotoStaff AS urlPhoto, typeUser = 'STAFF' FROM H2O.STAFF_COMPANY) AS UTU
       WHERE UTU.idUser = @idUser`);

    if (userCheck.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const type = userCheck.recordset[0].typeUser;
    let query = "";

    if (type === "CLIENTE") {
      query = `
        UPDATE H2O.CLIENTS_DATA SET urlPhotoClient = @urlImg WHERE idUser = @idUser;
        SELECT idUser, urlPhotoClient AS urlImg FROM H2O.CLIENTS_DATA WHERE idUser = @idUser;
      `;
    } else {
      query = `
        UPDATE H2O.STAFF_COMPANY SET urlPhotoStaff = @urlImg WHERE idUser = @idUser;
        SELECT idUser, urlPhotoStaff AS urlImg FROM H2O.STAFF_COMPANY WHERE idUser = @idUser;
      `;
    }

    const result = await pool.request()
      .input("idUser", sql.Int, idUser)
      .input("urlImg", sql.VarChar, urlImg)
      .query(query);

    res.status(200).json({
      success: true,
      message: req.file
        ? "Avatar actualizado correctamente con nueva imagen"
        : "Avatar actualizado con imagen predeterminada",
      data: result.recordset[0],
    });
  } catch (error) {
    console.error("Error al actualizar el avatar:", error);
    res.status(500).json({ success: false, message: "Error al actualizar el avatar", error: error.message });
  }
};


export const uploadProduct = async (req, res) => {
  try {
    const { nameProduct, idCategorie , description } = req.body;

    if (!nameProduct || !idCategorie || !description) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos: nameProduct o idCategorie." });
    }

    const folder = "products";
    let urlImg;

    if (req.file) {
      const filename = req.file.filename;
      const tempPath = req.file.path;
      urlImg = await processImage(tempPath, folder, filename);
    } else {
      urlImg = `http://h2o.isdapps.uk/public/img/${folder}/default.png`; // Asegúrate que exista esta imagen por defecto
    }

    const pool = await getConnection();

    // Insertar el producto
    const resultInsert = await pool.request()
      .input("nameProduct", sql.VarChar, nameProduct)
      .input("urlImage", sql.VarChar, urlImg)
      .input("idCategorie", sql.Int, idCategorie)
      .input("description", sql.NVarChar, description)
      .query(`
        INSERT INTO H2O.PRODUCTS (nameProduct, descriptionProduct, idCategorie, urlImage, idStatusProduct)
        VALUES (@nameProduct, @description, @idCategorie, @urlImage, 1);
        
        SELECT SCOPE_IDENTITY() AS idProduct;
      `);

    const idProduct = resultInsert.recordset[0].idProduct;

    // Consulta para traer tipos de cliente con precios
    const resultPrices = await pool.request()
      .input("idProduct", sql.Int, idProduct)
      .query(`
        SELECT 
          UT.idTypeUser,
          UT.nameType,
          CASE WHEN PP.price IS NULL THEN 0 ELSE PP.price END AS price,
          CASE WHEN PP.idStatusPrice IS NULL THEN 0 ELSE PP.idStatusPrice END AS idStatusPrice,
          CASE WHEN PP.idProduct IS NULL THEN @idProduct ELSE PP.idProduct END AS idProduct
        FROM H2O.USERS_TYPE AS UT
        LEFT JOIN H2O.PRODUCTS_PRICE PP 
          ON UT.idTypeUser = PP.idTypeUser AND PP.idProduct = @idProduct
        WHERE UT.nameType LIKE '%cliente%';
      `);

    res.status(201).json({
      success: true,
      message: "Producto creado correctamente",
      data: {
        idProduct,
        nameProduct,
        urlImg,
        prices: resultPrices.recordset,
      },
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ success: false, message: "Error interno al crear producto", error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const { idProduct, description, idCategorie } = req.body;

    if (!idProduct) {
      return res.status(400).json({ success: false, message: "Falta el campo requerido: idProduct." });
    }

    const folder = "products";
    let urlImg;

    if (req.file) {
      const filename = req.file.filename;
      const tempPath = req.file.path;
      urlImg = await processImage(tempPath, folder, filename);
    }

    const pool = await getConnection();

    // Crear query dinámica
    let query = "UPDATE H2O.PRODUCTS SET ";
    const fields = [];

    if (description) fields.push(`descriptionProduct = @descriptionProduct`);
    if (idCategorie) fields.push(`idCategorie = @idCategorie`);
    if (urlImg) fields.push(`urlImage = @urlImage`);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No hay campos para actualizar." });
    }

    query += fields.join(", ") + " WHERE idProduct = @idProduct";

    const request = pool.request()
      .input("idProduct", sql.Int, idProduct);

    if (description) request.input("descriptionProduct", sql.VarChar, description);
    if (idCategorie) request.input("idCategorie", sql.Int, idCategorie);
    if (urlImg) request.input("urlImage", sql.VarChar, urlImg);

    await request.query(query);

    res.status(200).json({
      success: true,
      message: "Producto actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ success: false, message: "Error interno al actualizar producto", error: error.message });
  }
};
