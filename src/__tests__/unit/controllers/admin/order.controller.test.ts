import { getAllOrders, updateOrderStatus } from "../../../../controllers/admin/order.controller";
import { OrderService } from "../../../../services/order.service";

jest.mock("../../../../services/order.service");

describe("Admin Order Controller", () => {
  let req: any;
  let res: any;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { json: jsonMock, status: statusMock };
    req = { params: { id: "order123" }, body: {} };
    jest.clearAllMocks();
  });

  describe("getAllOrders", () => {
    it("should return all orders successfully", async () => {
      (OrderService.getAllOrders as jest.Mock).mockResolvedValue([{ id: "order1" }]);
      await getAllOrders(req, res);
      expect(OrderService.getAllOrders).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith([{ id: "order1" }]);
    });

    it("should handle errors", async () => {
      (OrderService.getAllOrders as jest.Mock).mockRejectedValue(new Error("Fail"));
      await getAllOrders(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch orders" });
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status successfully", async () => {
      req.body = { status: "completed" };
      (OrderService.updateOrderStatus as jest.Mock).mockResolvedValue({ id: "order123", status: "completed" });
      await updateOrderStatus(req, res);
      expect(OrderService.updateOrderStatus).toHaveBeenCalledWith("order123", { status: "completed" });
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Order status updated successfully",
        order: { id: "order123", status: "completed" }
      });
    });

    it("should return 404 if order not found", async () => {
      req.body = { status: "completed" };
      (OrderService.updateOrderStatus as jest.Mock).mockRejectedValue(new Error("Order not found"));
      await updateOrderStatus(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Order not found" });
    });

    it("should return 400 if order already has the status", async () => {
      req.body = { status: "completed" };
      (OrderService.updateOrderStatus as jest.Mock).mockRejectedValue(new Error("Order is already completed"));
      await updateOrderStatus(req, res);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Order is already completed" });
    });

    it("should handle generic errors", async () => {
      req.body = { status: "completed" };
      (OrderService.updateOrderStatus as jest.Mock).mockRejectedValue(new Error("Unexpected error"));
      await updateOrderStatus(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Unexpected error" });
    });
  });
});