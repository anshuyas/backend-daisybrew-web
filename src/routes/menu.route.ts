import express from "express";
import { getMenuForUsers } from "../controllers/admin/menu.controller";

const router = express.Router();

// PUBLIC route (no auth)
router.get("/", getMenuForUsers);

export default router;
