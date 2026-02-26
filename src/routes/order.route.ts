import express from "express";
import { authorized } from "../middlewares/auth.middleware";
import { createOrder, getUserOrders } from "../controllers/order.controller";

const router = express.Router();

// All routes require auth
router.use(authorized);

router.post("/", createOrder);
router.get("/", getUserOrders);

export default router;