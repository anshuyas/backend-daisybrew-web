import { Router } from "express";
import { authorized } from "../middlewares/auth.middleware"; 

const router = Router();

// GET /api/user/me -> return logged-in user
router.get("/me", authorized, (req: any, res) => {
  res.status(200).json({
    user: req.user, // req.user comes from authorized middleware
  });
});

export default router;
