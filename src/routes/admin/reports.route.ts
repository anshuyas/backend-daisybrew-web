// routes/admin/reports.route.ts
import express from "express";
import { authorized } from "../../middlewares/auth.middleware";
import { isAdmin } from "../../middlewares/admin.middleware";
import { OrderModel } from "../../models/order.model";

const router = express.Router();

// Orders over time
router.get("/orders-over-time", authorized, isAdmin, async (req, res) => {
  try {
    const orders = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders over time" });
  }
});

// Top-selling drinks
router.get("/top-drinks", authorized, isAdmin, async (req, res) => {
  try {
    const drinks = await OrderModel.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);
    res.json(drinks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top drinks" });
  }
});

// Revenue analytics (total revenue, average order)
router.get("/revenue", authorized, isAdmin, async (req, res) => {
  try {
    const data = await OrderModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          averageOrder: { $avg: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);
    res.json(data[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch revenue data" });
  }
});

export default router;
