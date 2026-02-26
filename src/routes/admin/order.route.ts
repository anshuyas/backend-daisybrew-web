import express from "express";
import { authorized, isAdmin } from "../../middlewares/auth.middleware";
import { getAllOrders, updateOrderStatus } from "../../controllers/admin/order.controller";

const router = express.Router();

router.use(authorized, isAdmin);

router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

export default router;