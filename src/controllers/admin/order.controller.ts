import { Request, Response } from "express";
import { OrderService } from "../../services/order.service";
import { CreateOrderDto, UpdateOrderStatusDto } from "../../dtos/order.dto";

// GET /orders/admin (admin only)
export const getAllOrders = async (_req: any, res: Response) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json(orders);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// PUT /orders/:id/status (admin only)
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const dto: UpdateOrderStatusDto = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, dto);
    res.json({ message: "Order status updated successfully", order });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to update order status" });
  }
};