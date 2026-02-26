import express from "express";
import { authorized, isAdmin } from "../../middlewares/auth.middleware";
import { getAllNotifications } from "../../controllers/admin/notification.controller";

const router = express.Router();

router.use(authorized, isAdmin);

router.get("/", getAllNotifications);

export default router;