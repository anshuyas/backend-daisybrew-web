import { MenuRepository } from "../repositories/menu.repository";
import { CreateMenuItemDto, UpdateMenuItemDto } from "../dtos/menu.dto";
import { IMenuItem } from "../models/menu.model";

export class MenuService {
  static getAllMenu(): Promise<IMenuItem[]> {
    return MenuRepository.getAll();
  }

  static getMenuForUsers(): Promise<IMenuItem[]> {
    return MenuRepository.getMenuForUsers();
  }

  static createMenuItem(data: CreateMenuItemDto): Promise<IMenuItem> {
    return MenuRepository.create(data);
  }

  static updateMenuItem(id: string, data: UpdateMenuItemDto): Promise<IMenuItem | null> {
    return MenuRepository.update(id, data);
  }

  static deleteMenuItem(id: string): Promise<void> {
    return MenuRepository.delete(id);
  }

  static toggleAvailability(id: string, isAvailable: boolean): Promise<IMenuItem | null> {
    return MenuRepository.toggleAvailability(id, isAvailable);
  }
}