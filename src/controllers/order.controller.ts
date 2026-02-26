import { Request, Response } from "express";
import { OrderService } from "../services/order.service";

// POST /orders → create new order
export const createOrder = async (req: any, res: Response) => {
  try {
    const order = await OrderService.createOrder(req.user._id, req.body);
    res.status(201).json(order);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create order" });
  }
};

// GET /orders → get logged-in user's orders
export const getUserOrders = async (req: any, res: Response) => {
  try {
    const orders = await OrderService.getUserOrders(req.user._id);
    res.json(orders);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};