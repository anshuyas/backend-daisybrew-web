import { OrderModel } from "../models/order.model";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dtos/order.dto";

export class OrderRepository {
  // Create a new order
  static async create(userId: string, data: CreateOrderDto) {
    const order = new OrderModel({
      user: userId,
      items: data.items,
      total: data.total,
      deliveryOption: data.deliveryOption,
      timeOption: data.timeOption,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
      paymentMethod: data.paymentMethod,
      customerDetails: data.customerDetails,
      status: "confirmed", 
    });

    return await order.save(); 
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