import { Request, Response } from "express";
import { MenuService } from "../services/menu.service";  

export const getMenuForUsers = async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuService.getMenuForUsers(); 
    res.json({ success: true, data: menuItems });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch menu" });
  }
};