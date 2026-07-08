import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from "../controllers/authController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

export default router;
