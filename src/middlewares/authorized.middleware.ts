import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: any;
}

export const authorized = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

     if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Find user by ID from token
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request object
    req.user = user;

    next(); // pass control to next middleware
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Admin check middleware
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }

  next();
};
