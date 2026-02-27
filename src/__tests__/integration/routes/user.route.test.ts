// src/__tests__/integration/routes/user.route.test.ts
import request from "supertest";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import bcrypt from "bcryptjs";

// Mock authorized middleware only
jest.mock("../../../middlewares/auth.middleware", () => {
  const original = jest.requireActual("../../../middlewares/auth.middleware");
  return {
    ...original,
    authorized: (req: any, res: any, next: any) => {
      req.user = { _id: "000000000000000000000001", fullName: "Test User" };
      next();
    },
  };
});

describe("Public User Routes", () => {
  let testUser: any;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    const hashed = await bcrypt.hash("password123", 10);
    testUser = await UserModel.create({
      _id: "000000000000000000000001",
      fullName: "Test User",
      email: "test@example.com",
      password: hashed,
      role: "user",
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
  });

  it("GET /api/user/me -> success 200", async () => {
    const res = await request(app).get("/api/user/me");
    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe("Test User");
  });

  it("PUT /api/user/update -> success 200", async () => {
    const res = await request(app)
      .put("/api/user/update")
      .send({ fullName: "Updated User", email: "updated@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe("Updated User");
  });

  it("PUT /api/user/update -> server error 500", async () => {
    jest.spyOn(UserModel, "findByIdAndUpdate").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });
    const res = await request(app)
      .put("/api/user/update")
      .send({ fullName: "Fail User" });
    expect(res.status).toBe(500);
  });

  it("PUT /api/user/change-password -> user not found 404", async () => {
    // Mock findById().select() chain to return null
    jest.spyOn(UserModel, "findById").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce(null),
    }) as any);

    const res = await request(app)
      .put("/api/user/change-password")
      .send({ currentPassword: "password123", newPassword: "newpass" });
    expect(res.status).toBe(404);
  });

  it("PUT /api/user/change-password -> current password incorrect 400", async () => {
    // Mock findById().select() to return user with a different password
    const hashed = await bcrypt.hash("otherpass", 10);
    jest.spyOn(UserModel, "findById").mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValueOnce({
        _id: testUser._id,
        password: hashed,
        save: jest.fn(),
      }),
    }) as any);

    const res = await request(app)
      .put("/api/user/change-password")
      .send({ currentPassword: "wrongpass", newPassword: "newpass" });
    expect(res.status).toBe(400);
  });

  it("PUT /api/user/change-password -> success 200", async () => {
    const res = await request(app)
      .put("/api/user/change-password")
      .send({ currentPassword: "password123", newPassword: "newpass" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password changed successfully");
  });
});