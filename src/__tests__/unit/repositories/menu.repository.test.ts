import { MenuRepository } from '../../../repositories/menu.repository';
import MenuModel, { IMenuItem } from '../../../models/menu.model';
import { CreateMenuItemDto } from '../../../dtos/menu.dto';

describe('MenuRepository Unit Tests', () => {
  let menuId: string;

  const testItem: CreateMenuItemDto = {
    name: 'Cappuccino',
    price: 5,
    image: 'cappuccino.png',       
    category: 'Coffee',         
  };

  beforeAll(async () => {
    await MenuModel.deleteMany({});
  });

  afterAll(async () => {
    await MenuModel.deleteMany({});
  });

  describe('create()', () => {
    it('should create a new menu item', async () => {
      const menu = await MenuRepository.create(testItem);
      expect(menu).toBeDefined();
      expect(menu.name).toBe(testItem.name);
      menuId = menu._id.toString();
    });
  });

  describe('getAll()', () => {
    it('should return all menu items', async () => {
      const items = await MenuRepository.getAll();
      expect(items.length).toBeGreaterThan(0);
    });
  });

  describe('getMenuForUsers()', () => {
    it('should return only available menu items', async () => {
      const items = await MenuRepository.getMenuForUsers();
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(i => i.isAvailable)).toBe(true);
    });
  });

  describe('update()', () => {
    it('should update menu item', async () => {
      const updated = await MenuRepository.update(menuId, { price: 6 });
      expect(updated).not.toBeNull();
      expect(updated?.price).toBe(6);
    });

    it('should return null if item does not exist', async () => {
      const updated = await MenuRepository.update('507f1f77bcf86cd799439011', { price: 6 });
      expect(updated).toBeNull();
    });
  });

  describe('toggleAvailability()', () => {
    it('should toggle isAvailable flag', async () => {
      const updated = await MenuRepository.toggleAvailability(menuId, false);
      expect(updated?.isAvailable).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delete menu item', async () => {
      await MenuRepository.delete(menuId);
      const item = await MenuModel.findById(menuId);
      expect(item).toBeNull();
    });
  });
});