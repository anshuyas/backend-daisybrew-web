import request from "supertest";
import app from "../../../app";
import MenuItem from "../../../models/menu.model";
import { MenuService } from "../../../services/menu.service";

describe("Menu Routes", () => {
  beforeAll(async () => {
    await MenuItem.deleteMany({});
  });

  afterAll(async () => {
    await MenuItem.deleteMany({});
    jest.restoreAllMocks();
  });

  it("GET /api/menu -> success 200", async () => {
    await MenuItem.create({
      name: "Latte",
      price: 5,
      image: "latte.jpg",
      category: "Coffee",
      isAvailable: true,
    });

    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toBe("Latte");
  });

  it("GET /api/menu -> server error 500", async () => {
    jest.spyOn(MenuService, "getMenuForUsers").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });

    const res = await request(app).get("/api/menu");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Failed to fetch menu");
  });
});