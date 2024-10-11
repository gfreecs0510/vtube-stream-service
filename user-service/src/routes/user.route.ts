import { Router } from "express";
import {
  register,
  login,
  changePassword,
  getUser,
  subscribe,
  unsubscribe,
} from "../controllers/user.controller";
import { validateSchema } from "../middleware/ajv.middleware";
import { verifyToken } from "../middleware/verifyToken.middleware";
const router = Router();

router.post("/register", validateSchema("RegisterRequest"), register);
router.post("/login", validateSchema("LoginRequest"), login);
router.patch(
  "/changePassword",
  verifyToken,
  validateSchema("ChangePasswordRequest"),
  changePassword,
);

router.get("/:id", getUser);
router.post("/:id/subscribe", verifyToken, subscribe);
router.delete("/:id/unsubscribe", verifyToken, unsubscribe);

export default router;
