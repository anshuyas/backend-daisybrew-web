import express from "express";
import { OrderModel } from "../models/order.model";
import { authorized } from "../middlewares/auth.middleware";

const router = express.Router();

/* Create new order */

router.post("/", authorized, async (req: any, res) => {
  try {
    const {
      items,
      total,
      deliveryOption,
      timeOption,
      scheduledTime,
      paymentMethod,
      customerDetails,
    } = req.body;

    if (!items || !items.length || !total || !deliveryOption || !timeOption || !paymentMethod || !customerDetails) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const order = await OrderModel.create({
      user: req.user._id,
      items,
      total,
      deliveryOption,
      timeOption,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      paymentMethod,
      customerDetails,
    });

    res.status(201).json(order);
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
});

/* Get logged in user's orders*/

router.get("/", authorized, async (req: any, res) => {
  try {
    const orders = await OrderModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

export default router;
