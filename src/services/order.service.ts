import { OrderRepository } from "../repositories/order.repository";
import NotificationModel from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";

export class OrderService {
  // Create order & send notifications
  static async createOrder(userId: string, data: CreateOrderDto) {
    // Create order
    const order = await OrderRepository.create(userId, data);
    const shortId = order._id.toString().slice(-6);
    const user = await UserModel.findById(userId).select("fullName email");

    // Notify user
    await NotificationModel.create({
      user: order.user,
      message: `Your order #${shortId} is CONFIRMED`,
    });

    // Notify admin(s)
    const admins = await UserModel.find({ role: "admin" });
    for (const admin of admins) {
      await NotificationModel.create({
        user: admin._id,
        message: `New order #${shortId} placed by ${user?.fullName || user?.email || "a user"}`,
      });
    }

    return order;
  }

  // Get orders for a user
  static getUserOrders(userId: string) {
    return OrderRepository.getUserOrders(userId);
  }

  // Get all orders (admin)
  static getAllOrders() {
    return OrderRepository.getAllOrders();
  }

  // Update order status & notify
  static async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === data.status) throw new Error(`Order is already ${data.status}`);

    // Update
    await OrderRepository.updateStatus(orderId, data.status);
    const shortId = order._id.toString().slice(-6);

    // Notify user
    if (order.user?._id) {
      await NotificationModel.create({
        user: order.user._id,
        message: `Your order #${shortId} is now ${data.status.toUpperCase()}`,
      });
    }

    // Notify admin(s)
    const admins = await UserModel.find({ role: "admin" });
    for (const admin of admins) {
      await NotificationModel.create({
        user: admin._id,
        message: `Order #${shortId} status changed to ${data.status.toUpperCase()}`,
      });
    }

    order.status = data.status;
    return order;
  }
}