import { Router } from "express";
import {
  uploadCategory,
  uploadAvatar,
  uploadUpdateCategory,
  uploadImage,
  uploadProduct,
  updateProduct,
} from "../controllers/upload.controllers.js"; // nombre actualizado si cambiaste el archivo

const router = Router();

// 🏷️ Categorías
router.post("/upload/categories", uploadImage, uploadCategory);
router.post("/upload/updatecategory", uploadImage, uploadUpdateCategory);

// 🧑‍🦱 Avatares
router.post("/upload/avatars", uploadImage, uploadAvatar);


router.post("/upload/products", uploadImage, uploadProduct);

router.post("/upload/updateProducts", uploadImage, updateProduct);


export default router;
