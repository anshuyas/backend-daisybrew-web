import { authorized, isAdmin } from "../../../middlewares/auth.middleware";
import { UserModel } from "../../../models/user.model";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../../../models/user.model");

describe("Middleware: authorized", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization header", async () => {
    await authorized(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not authorized, no token",
    });
  });

  it("should return 401 if token format is invalid", async () => {
    req.headers.authorization = "InvalidToken";

    await authorized(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 if user not found", async () => {
    req.headers.authorization = "Bearer validtoken";

    (jwt.verify as jest.Mock).mockReturnValue({ id: "123" });

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await authorized(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it("should call next() if token and user are valid", async () => {
    const fakeUser = { _id: "123", role: "admin" };

    req.headers.authorization = "Bearer validtoken";

    (jwt.verify as jest.Mock).mockReturnValue({ id: "123" });

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await authorized(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if jwt verification fails", async () => {
    req.headers.authorization = "Bearer invalidtoken";

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await authorized(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not authorized, token failed",
    });
  });
});

describe("Middleware: isAdmin", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 401 if user missing", () => {
    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 403 if user is not admin", () => {
    req.user = { role: "user" };

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Access denied. Admin only.",
    });
  });

  it("should call next() if user is admin", () => {
    req.user = { role: "admin" };

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});