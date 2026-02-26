import MenuModel, { IMenuItem } from "../models/menu.model";
import { CreateMenuItemDto, UpdateMenuItemDto } from "../dtos/menu.dto";

export class MenuRepository {
  static getAll(): Promise<IMenuItem[]> {
    return MenuModel.find();
  }

  static getMenuForUsers(): Promise<IMenuItem[]> {
    return MenuModel.find({ isAvailable: true });
  }

  static create(data: CreateMenuItemDto): Promise<IMenuItem> {
    return MenuModel.create(data);
  }

  static update(id: string, data: UpdateMenuItemDto): Promise<IMenuItem | null> {
    return MenuModel.findByIdAndUpdate(id, data, { new: true });
  }

  static delete(id: string): Promise<void> {
    return MenuModel.findByIdAndDelete(id).then(() => {});
  }

  static toggleAvailability(id: string, isAvailable: boolean): Promise<IMenuItem | null> {
    return MenuModel.findByIdAndUpdate(id, { isAvailable }, { new: true });
  }
}