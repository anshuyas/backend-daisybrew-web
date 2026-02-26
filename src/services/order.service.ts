// order/services/order.service.ts
import { OrderRepository } from "../repositories/order.repository";
import NotificationModel from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";

export class OrderService {
  static async createOrder(userId: string, data: CreateOrderDto) {
    const order = await OrderRepository.create(userId, data);
    const shortId = order._id.toString().slice(-6);

    // Notify user
    await NotificationModel.create({
      user: order.user,
      message: `Your order #${shortId} is CONFIRMED`,
    });

    // Notify admin
    const admin = await UserModel.findOne({ role: "admin" });
    if (admin) {
      await NotificationModel.create({
        user: admin._id,
        message: `New order #${shortId} placed by ${userId}`,
      });
    }

    return order;
  }

  static getUserOrders(userId: string) {
    return OrderRepository.getUserOrders(userId);
  }

  static getAllOrders() {
    return OrderRepository.getAllOrders();
  }

  static async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await OrderRepository.findById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === data.status) throw new Error(`Order is already ${data.status}`);

    await OrderRepository.updateStatus(orderId, data.status);
    const shortId = order._id.toString().slice(-6);

    // Notify user
    if (order.user?._id) {
      await NotificationModel.create({
        user: order.user._id,
        message: `Your order #${shortId} is now ${data.status.toUpperCase()}`,
      });
    }

    // Notify admin
    const admin = await UserModel.findOne({ role: "admin" });
    if (admin?._id) {
      await NotificationModel.create({
        user: admin._id,
        message: `Order #${shortId} status changed to ${data.status.toUpperCase()}`,
      });
    }

    order.status = data.status;
    return order;
  }
}