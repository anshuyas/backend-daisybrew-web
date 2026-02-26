import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

// GET /notifications → get logged-in user's notifications
export const getNotifications = async (req: any, res: Response) => {
  try {
    const notifications = await NotificationService.getUserNotifications(req.user._id);
    res.json(notifications);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// PATCH /notifications/:id/read → mark a notification as read
export const markNotificationAsRead = async (req: any, res: Response) => {
  try {
    await NotificationService.markAsRead(req.params.id);
    res.json({ message: "Notification marked as read" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to update notification" });
  }
};

// POST /notifications → create a new notification
export const createNotification = async (req: any, res: Response) => {
  try {
    const newNotif = await NotificationService.createNotification(req.user._id, req.body);
    res.status(201).json(newNotif);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to create notification" });
  }
};