import { OrderModel } from "../models/order.model";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";

export class OrderRepository {
  // Create a new order
  static create(userId: string, data: CreateOrderDto) {
    return OrderModel.create({
      user: userId,
      ...data,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
    });
  }

  // Get orders for a specific user
  static getUserOrders(userId: string) {
    return OrderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Get all orders (admin)
  static getAllOrders() {
    return OrderModel.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });
  }

  // Find order by ID
  static findById(orderId: string) {
    return OrderModel.findById(orderId).populate("user");
  }

  // Update order status
  static async updateStatus(orderId: string, status: UpdateOrderStatusDto["status"]) {
    const order = await OrderModel.findById(orderId);
    if (!order) throw new Error("Order not found");
    order.status = status;
    return order.save();
  }
}