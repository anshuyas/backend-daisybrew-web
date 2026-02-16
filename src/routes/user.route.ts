import { Router } from "express";
import { authorized } from "../middlewares/auth.middleware";
import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

const router = Router();

// GET /api/user/me -> return logged-in user
router.get("/me", authorized, (req: any, res) => {
  res.status(200).json({
    user: req.user, // req.user comes from authorized middleware
  });
});

// Update profile
router.put("/update", authorized, async (req: any, res) => {
  try {
    const userId = req.user._id;

    const { fullName, email, mobile, location } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { fullName, email, mobile, location },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", authorized, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
