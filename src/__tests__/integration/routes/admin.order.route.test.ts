import request from "supertest";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import { OrderModel } from "../../../models/order.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin Order Routes Integration Tests", () => {
  let adminToken: string;
  let userToken: string;
  let orderId: string;

  beforeAll(async () => {
    // Clean up users & orders
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    // Create admin user
    const hashedPassword = await bcryptjs.hash("adminpass", 10);
    const admin = await UserModel.create({
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      fullName: "Admin User",
    });

    adminToken = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // Create normal user
    const hashedUserPassword = await bcryptjs.hash("userpass", 10);
    const user = await UserModel.create({
      email: "user@test.com",
      password: hashedUserPassword,
      role: "user",
      fullName: "Normal User",
    });

    userToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // Create an order
    const order = await OrderModel.create({
      user: user._id,
      items: [{ name: "Coffee", price: 5, quantity: 2 }],
      total: 10,
      deliveryOption: "pickup",
      timeOption: "asap",
      paymentMethod: "cod",
      status: "confirmed",
      customerDetails: { fullName: "Normal User", phone: "1234567890" },
    });

    orderId = order._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
  });

  describe("GET /api/admin/orders", () => {
    it("should fetch all orders for admin", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app).get("/api/admin/orders");
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/admin/orders/:id/status", () => {
  it("should update order status (admin only)", async () => {
    const res = await request(app)
      .put(`/api/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ready" });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe("ready"); 
  });

  it("should return 404 if order does not exist", async () => {
    const res = await request(app)
      .put("/api/admin/orders/507f1f77bcf86cd799439011/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "ready" }); 

    expect(res.status).toBe(404);
  });

    it("should return 404 if order does not exist", async () => {
      const res = await request(app)
        .put("/api/admin/orders/507f1f77bcf86cd799439011/status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(404);
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(403);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(401);
    });
  });
});