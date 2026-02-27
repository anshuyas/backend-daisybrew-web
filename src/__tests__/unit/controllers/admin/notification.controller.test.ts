import { getAllNotifications } from "../../../../controllers/admin/notification.controller";
import { AdminNotificationService } from "../../../../services/admin/notification.service";

jest.mock("../../../../services/admin/notification.service");

describe("Admin Notification Controller", () => {
  let req: any;
  let res: any;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { json: jsonMock, status: statusMock };
    req = {};
    jest.clearAllMocks();
  });

  it("should fetch all notifications successfully", async () => {
    (AdminNotificationService.getAllNotificationsForAdmin as jest.Mock).mockResolvedValue([{ message: "Admin notif" }]);
    await getAllNotifications(req, res);
    expect(AdminNotificationService.getAllNotificationsForAdmin).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalledWith([{ message: "Admin notif" }]);
  });

  it("should handle errors", async () => {
    (AdminNotificationService.getAllNotificationsForAdmin as jest.Mock).mockRejectedValue(new Error("Fail"));
    await getAllNotifications(req, res);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch admin notifications" });
  });
});