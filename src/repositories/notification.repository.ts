import NotificationModel from "../models/notification.model";
import { CreateNotificationDto, UpdateNotificationDto } from "../dtos/notification.dto";

export class NotificationRepository {
  // Get notifications for a user
  static getUserNotifications(userId: string) {
    return NotificationModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  // Mark notification as read
  static markAsRead(notificationId: string) {
    return NotificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }

  // Create new notification
  static create(userId: string, data: CreateNotificationDto) {
    return NotificationModel.create({ user: userId, message: data.message });
  }

  static getAllForAdmin() {
    return NotificationModel.find().populate("user", "fullName email").sort({ createdAt: -1 });
  }
}