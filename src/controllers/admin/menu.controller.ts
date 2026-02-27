import { Request, Response } from "express";
import { MenuService } from "../../services/menu.service";
import { CreateMenuItemDto, UpdateMenuItemDto } from "../../dtos/menu.dto";

// GET /admin/menu
export const getAllMenu = async (_req: Request, res: Response) => {
  try {
    const menuItems = await MenuService.getAllMenu();
    res.json({ success: true, data: menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch menu" });
  }
};

// POST /admin/menu
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    const price = Number(req.body.price);
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const dto: CreateMenuItemDto = { name, price, category, image };
    const menuItem = await MenuService.createMenuItem(dto);

    res.json({ success: true, data: menuItem });
  } catch (err: any) {
  console.error("CREATE MENU ERROR:", err);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Failed to create menu item" 
  });
}
};

// PUT /admin/menu/:id
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const updateData: UpdateMenuItemDto = { name, category };
    if (req.body.price !== undefined) {
  updateData.price = Number(req.body.price);
}

    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const updated = await MenuService.updateMenuItem(id, updateData);
    if (!updated) return res.status(404).json({ success: false, message: "Menu item not found" });

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
    await MenuService.deleteMenuItem(id);
    res.json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete menu item" });
  }
};

// PATCH /admin/menu/:id/availability
export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const item = await MenuService.toggleAvailability(id, isAvailable);
    if (!item) return res.status(404).json({ success: false, message: "Menu item not found" });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to toggle availability" });
  }
};