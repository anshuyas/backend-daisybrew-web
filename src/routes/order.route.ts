import express from "express";
import { OrderModel } from "../models/order.model";
import { authorized } from "../middlewares/auth.middleware";
import NotificationModel from "../models/notification.model";
import { UserModel } from "../models/user.model";
import { isAdmin } from "../middlewares/admin.middleware";

const router = express.Router();

/* Create new order */

router.post("/", authorized, async (req: any, res) => {
  try {
    const {
      items,
      total,
      deliveryOption,
      timeOption,
      scheduledTime,
      paymentMethod,
      customerDetails,
    } = req.body;

    if (!items || !items.length || !total || !deliveryOption || !timeOption || !paymentMethod || !customerDetails) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    const order = await OrderModel.create({
      user: req.user._id,
      items,
      total,
      deliveryOption,
      timeOption,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      paymentMethod,
      customerDetails,
    });

    const shortId = order._id.toString().slice(-6);

    //Notify user
    const userNotif = await NotificationModel.create({
      user: order.user,
      message: `Your order #${shortId} is CONFIRMED`,
    });
    console.log("User notification created:", userNotif);

     // Notify admin
     const admin = await UserModel.findOne({ role: "admin" });
    if (admin) {
      const adminNotif = await NotificationModel.create({
        user: admin._id,
        message: `New order #${shortId} placed by ${req.user.fullName || req.user.email}`,
      });
      console.log("Admin notification created:", adminNotif);
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
});

/* Get logged in user's orders*/

router.get("/", authorized, async (req: any, res) => {
  try {
    const orders = await OrderModel
      .find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* Get all orders (admin only) */
router.get("/admin", authorized, isAdmin, async (req, res) => {
  try {
    const orders = await OrderModel
      .find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* Update order status (admin only) */
router.put("/:id/status", authorized, isAdmin, async (req: any, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await OrderModel.findById(req.params.id).populate("user");
    console.log("Order user id:", order?.user?._id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent duplicate updates
    if (order.status === status) {
      return res.status(400).json({
        message: `Order is already ${status}`,
      });
    }

    // Update status
    order.status = status;
    await order.save();

    const shortId = order._id.toString().slice(-6);

    // Notify USER
      if (order.user?._id) {
      const userNotif = await NotificationModel.create({
        user: order.user._id,
        message: `Your order #${shortId} is now ${status.toUpperCase()}`,
      });
      console.log("User notification created:", userNotif);
    }

    // Notify ADMIN (optional)
   const admin = await UserModel.findOne({ role: "admin" });
    if (admin?._id) {
      await NotificationModel.create({
        user: admin._id,
        message: `Order #${shortId} status changed to ${status.toUpperCase()}`,
      });
      console.log("Admin notification created for order", shortId);
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to update order status" });
  }
});

export default router;
