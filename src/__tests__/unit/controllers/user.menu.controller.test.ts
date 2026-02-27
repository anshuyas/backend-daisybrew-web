import { getMenuForUsers } from "../../../controllers/menu.controller";
import { MenuService } from "../../../services/menu.service";

jest.mock("../../../services/menu.service");

describe("MenuController (public)", () => {
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {};
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  it("should fetch menu successfully", async () => {
    const menuData = [{ name: "Cappuccino", price: 5 }];
    (MenuService.getMenuForUsers as jest.Mock).mockResolvedValue(menuData);

    await getMenuForUsers(req, res);

    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: menuData });
  });

  it("should handle errors", async () => {
    (MenuService.getMenuForUsers as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await getMenuForUsers(req, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      message: "Failed to fetch menu",
    });
  });
});