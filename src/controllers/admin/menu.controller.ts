import { Request, Response } from "express";
import MenuModel, { IMenuItem } from "../../models/menu.model";
import { uploads } from "../../middlewares/upload.middleware";

// GET /admin/menu
export const getAllMenu = async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuModel.find();
    res.json({ success: true, data: menuItems });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch menu" });
  }
};

// POST /admin/menu
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const menuItem = await MenuModel.create({ name, price, category, image });
    res.json({ success: true, data: menuItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create menu item" });
  }
};

// PUT /admin/menu/:id
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;
    const updateData: Partial<IMenuItem> = { name, price, category };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await MenuModel.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update menu item" });
  }
};

// DELETE /admin/menu/:id
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await MenuModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete menu item" });
  }
};

export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = await MenuModel.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    );

     if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to toggle availability" });
  }
};

export const getMenuForUsers = async (req: Request, res: Response) => {
  try {
    const menuItems = await MenuModel.find(); 
    res.json({ success: true, data: menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch menu" });
  }
};
