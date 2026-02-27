import request from "supertest";
import app from "../../../app";
import { OrderModel } from "../../../models/order.model";
import { OrderService } from "../../../services/order.service";

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

describe("Order Routes", () => {
  let orderId: string;

  beforeAll(async () => {
    await OrderModel.deleteMany({});
  });

  afterAll(async () => {
    await OrderModel.deleteMany({});
    jest.restoreAllMocks();
  });

  it("POST /api/orders -> success 201", async () => {
    const orderData = {
      items: [{ name: "Coffee", quantity: 2, price: 5 }],
      total: 10,
      deliveryOption: "delivery",
      timeOption: "asap",
      paymentMethod: "cod",
      customerDetails: { fullName: "John Doe" },
    };

    const res = await request(app).post("/api/orders").send(orderData);
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(10);
    orderId = res.body._id;
  });

  it("POST /api/orders -> server error 500", async () => {
    jest.spyOn(OrderService, "createOrder").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });

    const res = await request(app)
      .post("/api/orders")
      .send({
        items: [{ name: "Tea", quantity: 1, price: 3 }],
        total: 3,
        deliveryOption: "pickup",
        timeOption: "asap",
        paymentMethod: "cod",
        customerDetails: {},
      });

    expect(res.status).toBe(500);
  });

  it("GET /api/orders -> success 200", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /api/orders -> server error 500", async () => {
    jest.spyOn(OrderService, "getUserOrders").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });

    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(500);
  });
});