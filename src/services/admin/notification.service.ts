import { NotificationRepository } from "../../repositories/notification.repository";

export class AdminNotificationService {
  static getAllNotificationsForAdmin() {
    return NotificationRepository.getAllForAdmin();
  }
}