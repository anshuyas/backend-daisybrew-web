import { getNotifications, markNotificationAsRead, createNotification } from "../../../controllers/notification.controller";
import { NotificationService } from "../../../services/notification.service";

jest.mock("../../../services/notification.service");

describe("User Notification Controller", () => {
  let req: any;
  let res: any;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { json: jsonMock, status: statusMock };
    req = { user: { _id: "user123" }, params: { id: "notif123" }, body: { message: "Hello" } };
    jest.clearAllMocks();
  });

  describe("getNotifications", () => {
    it("should return notifications successfully", async () => {
      (NotificationService.getUserNotifications as jest.Mock).mockResolvedValue([{ message: "Test" }]);
      await getNotifications(req, res);
      expect(NotificationService.getUserNotifications).toHaveBeenCalledWith("user123");
      expect(jsonMock).toHaveBeenCalledWith([{ message: "Test" }]);
    });

    it("should handle errors", async () => {
      (NotificationService.getUserNotifications as jest.Mock).mockRejectedValue(new Error("Fail"));
      await getNotifications(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch notifications" });
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark notification as read", async () => {
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(undefined);
      await markNotificationAsRead(req, res);
      expect(NotificationService.markAsRead).toHaveBeenCalledWith("notif123");
      expect(jsonMock).toHaveBeenCalledWith({ message: "Notification marked as read" });
    });

    it("should handle errors", async () => {
      (NotificationService.markAsRead as jest.Mock).mockRejectedValue(new Error("Fail"));
      await markNotificationAsRead(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to update notification" });
    });
  });

  describe("createNotification", () => {
    it("should create a notification", async () => {
      (NotificationService.createNotification as jest.Mock).mockResolvedValue({ message: "Hello" });
      await createNotification(req, res);
      expect(NotificationService.createNotification).toHaveBeenCalledWith("user123", { message: "Hello" });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Hello" });
    });

    it("should handle errors", async () => {
      (NotificationService.createNotification as jest.Mock).mockRejectedValue(new Error("Fail"));
      await createNotification(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to create notification" });
    });
  });
});