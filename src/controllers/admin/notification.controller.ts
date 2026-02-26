import { Request, Response } from "express";
import { AdminNotificationService } from "../../services/admin/notification.service";

export const getAllNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await AdminNotificationService.getAllNotificationsForAdmin();
    res.json(notifications);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch admin notifications" });
  }
};