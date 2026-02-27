import request from "supertest";
import path from "path";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import { OrderModel } from "../../../models/order.model";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin User Routes Integration Tests", () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;

  const testImagePath = path.join(__dirname, "../fixtures/test-image.jpg"); 

  beforeAll(async () => {
    // Clean up users & orders
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});

    // Create admin user
    const hashedAdmin = await bcryptjs.hash("adminpass", 10);
    const admin = await UserModel.create({
      email: "admin@test.com",
      password: hashedAdmin,
      role: "admin",
      fullName: "Admin User",
    });

    adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Create normal user
    const hashedUser = await bcryptjs.hash("userpass", 10);
    const user = await UserModel.create({
      email: "user@test.com",
      password: hashedUser,
      role: "user",
      fullName: "Normal User",
    });

    userToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    userId = user._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    await OrderModel.deleteMany({});
  });

  // POST /api/admin/users
  describe("POST /api/admin/users", () => {
    it("should create a new user with image", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("fullName", "New User")
        .field("email", "newuser@test.com")
        .field("password", "newpass")
        .attach("image", testImagePath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe("New User");
      expect(res.body.data.email).toBe("newuser@test.com");
      expect(res.body.data.image).toBeDefined();
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`)
        .field("fullName", "Another User")
        .field("email", "another@test.com")
        .field("password", "pass");

      expect(res.status).toBe(403);
    });

    it("should return 401 if token missing", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .field("fullName", "No Token User")
        .field("email", "notoken@test.com")
        .field("password", "pass");

      expect(res.status).toBe(401);
    });
  });

  // GET /api/admin/users
  describe("GET /api/admin/users", () => {
    it("should fetch all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  // GET /api/admin/users/:id
  describe("GET /api/admin/users/:id", () => {
    it("should fetch a single user", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body.email).toBeDefined();
      expect(res.body.fullName).toBeDefined();
    });

    it("should return 404 if user does not exist", async () => {
      const res = await request(app)
        .get("/api/admin/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  // GET /api/admin/users/:id/orders
  describe("GET /api/admin/users/:id/orders", () => {
    it("should fetch user's orders", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${userId}/orders`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // PUT /api/admin/users/:id
  describe("PUT /api/admin/users/:id", () => {
    it("should update user info with image", async () => {
      const res = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("fullName", "Updated User")
        .attach("image", testImagePath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe("Updated User");
      expect(res.body.data.image).toBeDefined();
    });
  });

  // DELETE /api/admin/users/:id
  describe("DELETE /api/admin/users/:id", () => {
    it("should delete user", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
    });
  });
});