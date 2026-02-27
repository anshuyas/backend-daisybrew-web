import request from "supertest";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import NotificationModel from "../../../models/notification.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin Notification Routes", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    await NotificationModel.deleteMany({});

    // Admin user
    const hashedPassword = await bcryptjs.hash("adminpass", 10);
    const admin = await UserModel.create({
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
      fullName: "Admin User",
    });
    adminToken = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // Normal user
    const hashedUserPassword = await bcryptjs.hash("userpass", 10);
    const user = await UserModel.create({
      email: "user@test.com",
      password: hashedUserPassword,
      role: "user",
      fullName: "Normal User",
    });
    userToken = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "1d" });

    // Create notifications
    await NotificationModel.create([
      { user: admin._id, message: "Admin notification" },
      { user: user._id, message: "User notification" },
    ]);
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await NotificationModel.deleteMany({});
  });

  it("should fetch all notifications for admin", async () => {
    const res = await request(app)
      .get("/api/admin/notifications")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return 403 if user is not admin", async () => {
    const res = await request(app)
      .get("/api/admin/notifications")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(app)
      .get("/api/admin/notifications");

    expect(res.status).toBe(401);
  });
});