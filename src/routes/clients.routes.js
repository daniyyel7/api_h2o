import { Router } from "express";
import {
  getInformation,
  getAllClientCustom,
  createClientCustom,
  updateClientCustom,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "../controllers/clients.controllers.js";

const router = Router();

router.get("/client/profile/:idClient", getInformation);

router.get("/client/custom", getAllClientCustom);

router.post("/client/custom", createClientCustom);

router.post("/client/updateCustom", updateClientCustom);

router.post("/client/requestPasswordReset", requestPasswordReset);

router.post("/client/verifyResetCode", verifyResetCode);

router.post("/client/resetPassword", resetPassword);

export default router;
