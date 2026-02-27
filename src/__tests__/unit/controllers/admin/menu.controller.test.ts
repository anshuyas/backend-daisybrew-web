import { 
  getAllMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} from "../../../../controllers/admin/menu.controller";
import { MenuService } from "../../../../services/menu.service";

jest.mock("../../../../services/menu.service");

describe("Admin Menu Controller", () => {
  let req: any;
  let res: any;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { json: jsonMock, status: statusMock };
    req = { params: { id: "menu123" }, body: {}, file: undefined };
    jest.clearAllMocks();
  });

  describe("getAllMenu", () => {
    it("should return all menu items", async () => {
      (MenuService.getAllMenu as jest.Mock).mockResolvedValue([{ name: "Cappuccino" }]);
      await getAllMenu(req, res);
      expect(MenuService.getAllMenu).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: [{ name: "Cappuccino" }] });
    });

    it("should handle errors", async () => {
      (MenuService.getAllMenu as jest.Mock).mockRejectedValue(new Error("Fail"));
      await getAllMenu(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Failed to fetch menu" });
    });
  });

  describe("createMenuItem", () => {
    it("should create a menu item successfully", async () => {
      req.body = { name: "Latte", price: "5", category: "coffee" };
      (MenuService.createMenuItem as jest.Mock).mockResolvedValue({ name: "Latte" });

      await createMenuItem(req, res);
      expect(MenuService.createMenuItem).toHaveBeenCalledWith({
        name: "Latte",
        price: 5,
        category: "coffee",
        image: ""
      });
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { name: "Latte" } });
    });

    it("should handle errors", async () => {
      (MenuService.createMenuItem as jest.Mock).mockRejectedValue(new Error("Fail"));
      await createMenuItem(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Fail" });
    });
  });

  describe("updateMenuItem", () => {
    it("should update a menu item successfully", async () => {
      req.body = { name: "Updated Latte", price: "6", category: "coffee" };
      (MenuService.updateMenuItem as jest.Mock).mockResolvedValue({ name: "Updated Latte", price: 6 });
      await updateMenuItem(req, res);
      expect(MenuService.updateMenuItem).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { name: "Updated Latte", price: 6 } });
    });

    it("should return 404 if menu item not found", async () => {
      (MenuService.updateMenuItem as jest.Mock).mockResolvedValue(null);
      await updateMenuItem(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Menu item not found" });
    });

    it("should handle errors", async () => {
      (MenuService.updateMenuItem as jest.Mock).mockRejectedValue(new Error("Fail"));
      await updateMenuItem(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Failed to update menu item" });
    });
  });

  describe("deleteMenuItem", () => {
    it("should delete menu item successfully", async () => {
      (MenuService.deleteMenuItem as jest.Mock).mockResolvedValue(undefined);
      await deleteMenuItem(req, res);
      expect(MenuService.deleteMenuItem).toHaveBeenCalledWith("menu123");
      expect(jsonMock).toHaveBeenCalledWith({ success: true, message: "Menu item deleted" });
    });

    it("should handle errors", async () => {
      (MenuService.deleteMenuItem as jest.Mock).mockRejectedValue(new Error("Fail"));
      await deleteMenuItem(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Failed to delete menu item" });
    });
  });

  describe("toggleAvailability", () => {
    it("should toggle availability successfully", async () => {
      req.body = { isAvailable: false };
      (MenuService.toggleAvailability as jest.Mock).mockResolvedValue({ isAvailable: false });
      await toggleAvailability(req, res);
      expect(MenuService.toggleAvailability).toHaveBeenCalledWith("menu123", false);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { isAvailable: false } });
    });

    it("should return 404 if menu item not found", async () => {
      req.body = { isAvailable: true };
      (MenuService.toggleAvailability as jest.Mock).mockResolvedValue(null);
      await toggleAvailability(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Menu item not found" });
    });

    it("should handle errors", async () => {
      req.body = { isAvailable: true };
      (MenuService.toggleAvailability as jest.Mock).mockRejectedValue(new Error("Fail"));
      await toggleAvailability(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Failed to toggle availability" });
    });
  });
});