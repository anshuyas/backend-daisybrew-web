import express from "express";
import NotificationModel from "../models/notification.model";
import { authorized } from "../middlewares/authorized.middleware";

const router = express.Router();

// Get notifications
router.get("/", authorized, async (req: any, res) => {
  try {
    const notifications = await NotificationModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark as read
router.patch("/:id/read", authorized, async (req: any, res) => {
  try {
    await NotificationModel.findByIdAndUpdate(req.params.id, {
      read: true,
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});

router.post("/", authorized, async (req: any, res) => {
  try {
    const { message } = req.body;
    const newNotif = await NotificationModel.create({
      user: req.user._id,
      message,
    });
    res.status(201).json(newNotif);
  } catch (err) {
    res.status(500).json({ message: "Failed to create notification" });
  }
});

export default router;
