// src/__tests__/unit/controllers/admin/user.controller.test.ts
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserOrders } from "../../../../controllers/admin/user.controller";
import { UserModel } from "../../../../models/user.model";
import { OrderService } from "../../../../services/order.service";
import bcrypt from "bcryptjs";

jest.mock("../../../../models/user.model");
jest.mock("../../../../services/order.service");

describe("Admin User Controller", () => {
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, headers: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  //  createUser 
  describe("createUser", () => {
    it("should create user successfully", async () => {
      req.body = { fullName: "Test", email: "test@test.com", password: "123", role: "user" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue(true);
      (UserModel as any).mockImplementation(() => ({ ...req.body, save: saveMock, _id: "user1" }));

const hashSpy = jest
  .spyOn(bcrypt, "hash")
  .mockImplementation((data: string | Buffer, salt: string | number) => Promise.resolve("hashed"));
      await createUser(req, res);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ _id: "user1" }),
      }));

      hashSpy.mockRestore();
    });

    it("should return 400 if user exists", async () => {
      req.body = { fullName: "Test", email: "test@test.com", password: "123" };
      (UserModel.findOne as jest.Mock).mockResolvedValue(true);

      await createUser(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should handle errors", async () => {
      (UserModel.findOne as jest.Mock).mockRejectedValue(new Error("Fail"));
      req.body = { fullName: "Test", email: "test@test.com", password: "123" };

      await createUser(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ success: false, message: "Server error" });
    });
  });

  //  getAllUsers 
  describe("getAllUsers", () => {
    it("should return users with pagination", async () => {
      req.query = { page: "1", limit: "10", search: "" };
      const mockUsers = [{ _id: "user1" }];
      const selectMock = jest.fn().mockReturnThis();
      const skipMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const sortMock = jest.fn().mockResolvedValue(mockUsers);

      (UserModel.find as jest.Mock).mockReturnValue({
        select: selectMock.mockReturnValue({
          skip: skipMock.mockReturnValue({
            limit: limitMock.mockReturnValue({
              sort: sortMock,
            }),
          }),
        }),
      });
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(mockUsers.length);

      await getAllUsers(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        users: mockUsers,
        pagination: expect.any(Object),
      }));
    });

    it("should handle errors", async () => {
      (UserModel.countDocuments as jest.Mock).mockRejectedValue(new Error("Fail"));

      await getAllUsers(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  //  getUserById 
  describe("getUserById", () => {
    it("should return 404 if user not found", async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await getUserById(req, res);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return user successfully", async () => {
      const mockUser = { _id: "user1", fullName: "Test User" };
      (UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });

      await getUserById(req, res);

      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it("should handle errors", async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({ select: jest.fn().mockRejectedValue(new Error("Fail")) });

      await getUserById(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  //  updateUser 
  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      (UserModel.findById as jest.Mock).mockResolvedValue({ save: saveMock, _id: "user1", fullName: "Old", email: "old@test.com" });
      req.body = { fullName: "New" };
      await updateUser(req, res);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("should return 404 if user not found", async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      await updateUser(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should handle errors during save", async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error("Fail"));
      (UserModel.findById as jest.Mock).mockResolvedValue({ save: saveMock });
      await updateUser(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  //  deleteUser 
  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(true);
      await deleteUser(req, res);
      expect(jsonMock).toHaveBeenCalledWith({ message: "User deleted successfully" });
    });

    it("should return 404 if user not found", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      await deleteUser(req, res);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should handle errors", async () => {
      (UserModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error("Fail"));
      await deleteUser(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  //  getUserOrders 
  describe("getUserOrders", () => {
    it("should return user orders successfully", async () => {
      (OrderService.getUserOrders as jest.Mock).mockResolvedValue([{ orderId: "1" }]);
      req.params.id = "user1";

      await getUserOrders(req, res);

      expect(jsonMock).toHaveBeenCalledWith([{ orderId: "1" }]);
    });

    it("should handle errors", async () => {
      (OrderService.getUserOrders as jest.Mock).mockRejectedValue(new Error("Fail"));
      await getUserOrders(req, res);
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});