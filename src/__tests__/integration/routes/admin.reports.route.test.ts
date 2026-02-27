import request from "supertest";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import { OrderModel } from "../../../models/order.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin Reports Routes Integration Tests", () => {
  let adminToken: string;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    const hashedPassword = await bcryptjs.hash("adminpass", 10);
    const admin = await UserModel.create({
      fullName: "Admin User",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
    });

    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Create some test orders
    const orders = [
      {
        user: admin._id,
        items: [{ name: "Coffee", price: 5, quantity: 2 }],
        total: 10,
        deliveryOption: "pickup",
        timeOption: "asap",
        paymentMethod: "cod",
        status: "confirmed",
        customerDetails: { fullName: "Admin User" },
      },
      {
        user: admin._id,
        items: [{ name: "Latte", price: 7, quantity: 1 }],
        total: 7,
        deliveryOption: "delivery",
        timeOption: "later",
        paymentMethod: "online",
        status: "ready",
        customerDetails: { fullName: "Admin User" },
      },
    ];

    await OrderModel.insertMany(orders);
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
  });

  it("GET /orders-over-time - should return aggregated orders", async () => {
    const res = await request(app)
      .get("/api/admin/reports/orders-over-time")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /top-drinks - should return top selling drinks", async () => {
    const res = await request(app)
      .get("/api/admin/reports/top-drinks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /revenue - should return revenue analytics", async () => {
    const res = await request(app)
      .get("/api/admin/reports/revenue")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalRevenue");
    expect(res.body).toHaveProperty("averageOrder");
    expect(res.body).toHaveProperty("totalOrders");
  });
});