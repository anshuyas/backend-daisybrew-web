import request from "supertest";
import app from "../../../app";
import NotificationModel from "../../../models/notification.model";

jest.mock("../../../middlewares/authorized.middleware", () => {
  const original = jest.requireActual("../../../middlewares/authorized.middleware");
  return {
    ...original,
    authorized: (req: any, res: any, next: any) => {
      req.user = { _id: "000000000000000000000001", fullName: "Test User" };
      next();
    },
  };
});

describe("Notification Routes", () => {
  let notifId: any;

  beforeAll(async () => {
    await NotificationModel.deleteMany({});
  });

  afterAll(async () => {
    await NotificationModel.deleteMany({});
  });

  it("GET /api/notifications -> success 200", async () => {
    // insert dummy notification
    const notif = await NotificationModel.create({
      user: "000000000000000000000001",
      message: "Test message",
    });
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    notifId = res.body[0]._id;
  });

  it("GET /api/notifications -> server error 500", async () => {
    jest.spyOn(NotificationModel, "find").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(500);
  });

  it("PATCH /api/notifications/:id/read -> success 200", async () => {
    const res = await request(app).patch(`/api/notifications/${notifId}/read`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Notification marked as read");
  });

  it("PATCH /api/notifications/:id/read -> server error 500", async () => {
    jest.spyOn(NotificationModel, "findByIdAndUpdate").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });
    const res = await request(app).patch(`/api/notifications/${notifId}/read`);
    expect(res.status).toBe(500);
  });

  it("POST /api/notifications -> success 201", async () => {
    const res = await request(app)
      .post("/api/notifications")
      .send({ message: "New notification" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("New notification");
  });

  it("POST /api/notifications -> server error 500", async () => {
    jest.spyOn(NotificationModel, "create").mockImplementationOnce(() => {
      throw new Error("DB failure");
    });
    const res = await request(app)
      .post("/api/notifications")
      .send({ message: "Fail message" });
    expect(res.status).toBe(500);
  });
});