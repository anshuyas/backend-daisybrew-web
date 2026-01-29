import express from "express";
import { uploads } from "../../middlewares/upload.middleware";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../../controllers/admin/user.controller";
import { authorized, isAdmin } from "../../middlewares/auth.middleware"; // corrected import

const router = express.Router();

// POST /api/admin/users (create user with image)
router.post("/", authorized, isAdmin, uploads.single("image"), createUser);

// GET /api/admin/users
router.get("/", authorized, isAdmin, getAllUsers);

// GET /api/admin/users/:id
router.get("/:id", authorized, isAdmin, getUserById);

// PUT /api/admin/users/:id (update user with image)
router.put("/:id", authorized, isAdmin, uploads.single("image"), updateUser);

// DELETE /api/admin/users/:id
router.delete("/:id", authorized, isAdmin, deleteUser);

export default router;
