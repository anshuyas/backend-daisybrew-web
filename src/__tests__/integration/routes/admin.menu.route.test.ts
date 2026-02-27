import request from "supertest";
import path from "path";
import app from "../../../app";
import MenuModel from "../../../models/menu.model";
import { UserModel } from "../../../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Admin Menu Routes Integration Tests", () => {
  let adminToken: string;
  let userToken: string;
  let menuItemId: string;

  beforeAll(async () => {
    await MenuModel.deleteMany({});
    await UserModel.deleteMany({});

    // Create admin user
    const hashedAdmin = await bcrypt.hash("adminpass", 10);
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
    const hashedUser = await bcrypt.hash("userpass", 10);
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
  });

  afterAll(async () => {
    await MenuModel.deleteMany({});
    await UserModel.deleteMany({});
  });

  // GET /api/admin/menu
  describe("GET /api/admin/menu", () => {
    it("should return empty array initially", async () => {
      const res = await request(app)
        .get("/api/admin/menu")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });
  });

  // POST /api/admin/menu
  describe("POST /api/admin/menu", () => {
    it("should create a new menu item with image", async () => {
      const imagePath = path.join(__dirname, "../fixtures/test-image.jpg");

      const res = await request(app)
        .post("/api/admin/menu")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Cappuccino")
        .field("price", "5")
        .field("category", "Coffee")
        .attach("image", imagePath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("name", "Cappuccino");
      expect(res.body.data).toHaveProperty("price", 5);
      expect(res.body.data).toHaveProperty("image");

      menuItemId = res.body.data._id;
    });

    it("should return 403 if not admin", async () => {
      const res = await request(app)
        .post("/api/admin/menu")
        .set("Authorization", `Bearer ${userToken}`)
        .field("name", "Latte")
        .field("price", "4")
        .field("category", "Coffee");

      expect(res.status).toBe(403);
    });

    it("should return 401 if token missing", async () => {
      const res = await request(app)
        .post("/api/admin/menu")
        .field("name", "Latte")
        .field("price", "4")
        .field("category", "Coffee");

      expect(res.status).toBe(401);
    });
  });

  // PUT /api/admin/menu/:id
  describe("PUT /api/admin/menu/:id", () => {
    it("should update a menu item", async () => {
      const res = await request(app)
        .put(`/api/admin/menu/${menuItemId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("name", "Updated Cappuccino")
        .field("price", "6");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("name", "Updated Cappuccino");
      expect(res.body.data).toHaveProperty("price", 6);
    });
  });

  // PATCH /api/admin/menu/:id/availability
  describe("PATCH /api/admin/menu/:id/availability", () => {
    it("should toggle availability", async () => {
      const res = await request(app)
        .patch(`/api/admin/menu/${menuItemId}/availability`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ isAvailable: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.isAvailable).toBe("boolean");
      expect(res.body.data.isAvailable).toBe(false);
    });
  });

  // DELETE /api/admin/menu/:id
  describe("DELETE /api/admin/menu/:id", () => {
    it("should delete the menu item", async () => {
      const res = await request(app)
        .delete(`/api/admin/menu/${menuItemId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Menu item deleted");
    });
  });
});