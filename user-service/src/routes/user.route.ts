import { Router } from "express";
import {
  register,
  login,
  changePassword,
} from "../controllers/user.controller";
import { validateSchema } from "../middleware/ajv.middleware";
const router = Router();

router.post("/register", validateSchema("RegisterRequest"), register);
router.post("/login", validateSchema("LoginRequest"), login);
router.patch(
  "/changePassword",
  validateSchema("ChangePasswordRequest"),
  changePassword,
);

export default router;
