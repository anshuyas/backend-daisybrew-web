import express from "express";
import {
  getAllMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "../../controllers/admin/menu.controller";
import { authorized, isAdmin } from "../../middlewares/auth.middleware";
import { uploads } from "../../middlewares/upload.middleware";

const router = express.Router();

// All routes protected by admin auth
router.use(authorized, isAdmin);

// GET all
router.get("/", getAllMenu);

// POST new menu item (image upload)
router.post("/", uploads.single("image"), createMenuItem);

// PUT update menu item (image optional)
router.put("/:id", uploads.single("image"), updateMenuItem);

// DELETE menu item
router.delete("/:id", deleteMenuItem);

// For toggle
router.patch("/:id/availability", toggleAvailability);

export default router;
