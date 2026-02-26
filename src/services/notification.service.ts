import { NotificationRepository } from "../repositories/notification.repository";
import { CreateNotificationDto, UpdateNotificationDto } from "../dtos/notification.dto";

export class NotificationService {
  static getUserNotifications(userId: string) {
    return NotificationRepository.getUserNotifications(userId);
  }

  static markAsRead(notificationId: string) {
    return NotificationRepository.markAsRead(notificationId);
  }

  static createNotification(userId: string, data: CreateNotificationDto) {
    return NotificationRepository.create(userId, data);
  }
}