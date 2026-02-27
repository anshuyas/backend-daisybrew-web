import { AuthController } from "../../../controllers/auth.controller";
import { UserService } from "../../../services/user.service";
import * as emailConfig from "../../../config/email";
import crypto from "crypto";
import { registerUserDto, loginUserDto } from "../../../dtos/user.dto";

jest.mock("../../../services/user.service");
jest.mock("../../../config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock("crypto");

describe("AuthController", () => {
  let authController: AuthController;
  let req: any;
  let res: any;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    authController = new AuthController();
    req = { body: {} };
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = { status: statusMock, json: jsonMock };
    jest.clearAllMocks();
  });

  //  register 
  describe("register", () => {
    it("should register user successfully", async () => {
      req.body = { email: "test@test.com", password: "123456", fullName: "Test User" };
      (UserService.prototype.createUser as jest.Mock).mockResolvedValue({ id: "1", ...req.body });

      await authController.register(req, res);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ id: "1" }),
      }));
    });

    it("should handle validation error", async () => {
      req.body = { email: "", password: "123" }; // invalid
      await authController.register(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it("should handle service error", async () => {
      req.body = { email: "test@test.com", password: "123456", fullName: "Test User" };
      (UserService.prototype.createUser as jest.Mock).mockRejectedValue(new Error("Fail"));

      await authController.register(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: "Fail" }));
    });
  });

  //  login 
  describe("login", () => {
    it("should login user successfully", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      (UserService.prototype.loginUser as jest.Mock).mockResolvedValue({ token: "abc" });

      await authController.login(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        token: "abc",
      }));
    });

    it("should handle login error", async () => {
      req.body = { email: "test@test.com", password: "123456" };
      (UserService.prototype.loginUser as jest.Mock).mockRejectedValue(new Error("Fail"));

      await authController.login(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: "Fail" }));
    });
  });

  //  forgotPassword 
  describe("forgotPassword", () => {
    it("should send reset link successfully", async () => {
      req.body = { email: "test@test.com" };
      (UserService.prototype.setResetPasswordToken as jest.Mock).mockResolvedValue(true);
      (crypto.randomBytes as unknown as jest.Mock).mockReturnValue(Buffer.from("token123"));
      (emailConfig.sendEmail as jest.Mock).mockResolvedValue(true);

      await authController.forgotPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        resetToken: expect.any(String),
      }));
    });

    it("should return 400 if email missing", async () => {
      req.body = {};
      await authController.forgotPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it("should handle service error", async () => {
      req.body = { email: "test@test.com" };
      (UserService.prototype.setResetPasswordToken as jest.Mock).mockRejectedValue(new Error("Fail"));
      (crypto.randomBytes as unknown as jest.Mock).mockReturnValue(Buffer.from("token123"));

      await authController.forgotPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: "Fail" }));
    });
  });

  //  resetPassword 
  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      req.body = { token: "abc", password: "newpass" };
      (UserService.prototype.resetPassword as jest.Mock).mockResolvedValue(true);

      await authController.resetPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Password has been reset successfully',
      }));
    });

    it("should return 400 if token or password missing", async () => {
      req.body = { token: "" };
      await authController.resetPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Token and new password are required' });
    });

    it("should handle service error", async () => {
      req.body = { token: "abc", password: "newpass" };
      (UserService.prototype.resetPassword as jest.Mock).mockRejectedValue(new Error("Fail"));

      await authController.resetPassword(req, res);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ error: "Fail" }));
    });
  });
});