import { Request, Response } from "express";
import { UserModel } from "../../models/user.model";
import bcrypt from "bcryptjs";
import { OrderModel } from "../../models/order.model";
import { OrderService } from "../../services/order.service";

// CREATE USER (Admin)
export const createUser = async (req: any, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full Name, Email and Password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    // If image uploaded
    if (req.file) {
      newUser.image = req.file.filename;
    }

    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL USERS WITH PAGINATION + SEARCH
export const getAllUsers = async (req: any, res: Response) => {
  try {
    let { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = Math.max(parseInt(page, 10), 1);
    const limitNumber = Math.max(parseInt(limit, 10), 1);

    const query: any = {};

    // Search by email
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const totalUsers = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNumber);

    const users = await UserModel.find(query)
      .select("-password")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    res.status(200).json({
      users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER BY ID
export const getUserById = async (req: any, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get orders of a specific user
export const getUserOrders = async (req: any, res: Response) => {
  try {
    const userId = req.params.id;

    const orders = await OrderService.getUserOrders(userId);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// UPDATE USER
export const updateUser = async (req: any, res: Response) => {
  try {
    const { email, fullName, password, role } = req.body;
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      user.image = req.file.filename;
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
export const deleteUser = async (req: any, res: Response) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
