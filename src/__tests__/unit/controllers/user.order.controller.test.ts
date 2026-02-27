import { createOrder, getUserOrders } from "../../../controllers/order.controller";
import { OrderService } from "../../../services/order.service";

jest.mock("../../../services/order.service");

describe("OrderController (public)", () => {
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = { user: { _id: "user123" }, body: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  //  createOrder 
  describe("createOrder", () => {
    it("should create order successfully", async () => {
      const orderData = { _id: "order1", items: ["Cappuccino"] };
      (OrderService.createOrder as jest.Mock).mockResolvedValue(orderData);

      await createOrder(req, res);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(orderData);
    });

    it("should handle errors", async () => {
      (OrderService.createOrder as jest.Mock).mockRejectedValue(new Error("DB fail"));

      await createOrder(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "DB fail" });
    });
  });

  //  getUserOrders 
  describe("getUserOrders", () => {
    it("should fetch user orders successfully", async () => {
      const orders = [{ _id: "order1", items: ["Cappuccino"] }];
      (OrderService.getUserOrders as jest.Mock).mockResolvedValue(orders);

      await getUserOrders(req, res);

      expect(jsonMock).toHaveBeenCalledWith(orders);
    });

    it("should handle errors", async () => {
      (OrderService.getUserOrders as jest.Mock).mockRejectedValue(new Error("DB fail"));

      await getUserOrders(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch orders" });
    });
  });
});