import { MenuService } from '../../../services/menu.service';
import { MenuRepository } from '../../../repositories/menu.repository';
import { IMenuItem } from '../../../models/menu.model';
import { CreateMenuItemDto, UpdateMenuItemDto } from '../../../dtos/menu.dto';
import { Types } from 'mongoose';

jest.mock('../../../repositories/menu.repository');

describe('MenuService Unit Tests', () => {
  const mockItem: Partial<IMenuItem> = {
    _id: new Types.ObjectId(),
    name: 'Cappuccino',
    price: 5,
    isAvailable: true,
    image: 'cappuccino.jpg',
    category: 'Coffee',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getAllMenu should call repository.getAll', async () => {
    (MenuRepository.getAll as jest.Mock).mockResolvedValue([mockItem]);
    const result = await MenuService.getAllMenu();
    expect(MenuRepository.getAll).toHaveBeenCalled();
    expect(result).toEqual([mockItem]);
  });

  it('getMenuForUsers should call repository.getMenuForUsers', async () => {
    (MenuRepository.getMenuForUsers as jest.Mock).mockResolvedValue([mockItem]);
    const result = await MenuService.getMenuForUsers();
    expect(MenuRepository.getMenuForUsers).toHaveBeenCalled();
    expect(result).toEqual([mockItem]);
  });

  it('createMenuItem should call repository.create', async () => {
    const data: CreateMenuItemDto = {
      name: 'Cappuccino',
      price: 5,
      image: 'cappuccino.jpg',
      category: 'Coffee',
    };

    (MenuRepository.create as jest.Mock).mockResolvedValue(mockItem);
    const result = await MenuService.createMenuItem(data);
    expect(MenuRepository.create).toHaveBeenCalledWith(data);
    expect(result).toEqual(mockItem);
  });

  it('updateMenuItem should call repository.update', async () => {
    const updateData: UpdateMenuItemDto = { price: 6, name: 'Latte' };
    (MenuRepository.update as jest.Mock).mockResolvedValue(mockItem);
    const result = await MenuService.updateMenuItem('1', updateData);
    expect(MenuRepository.update).toHaveBeenCalledWith('1', updateData);
    expect(result).toEqual(mockItem);
  });

  it('deleteMenuItem should call repository.delete', async () => {
    (MenuRepository.delete as jest.Mock).mockResolvedValue(undefined);
    await MenuService.deleteMenuItem('1');
    expect(MenuRepository.delete).toHaveBeenCalledWith('1');
  });

  it('toggleAvailability should call repository.toggleAvailability', async () => {
    (MenuRepository.toggleAvailability as jest.Mock).mockResolvedValue({ ...mockItem, isAvailable: false });
    const result = await MenuService.toggleAvailability('1', false);
    expect(MenuRepository.toggleAvailability).toHaveBeenCalledWith('1', false);
    expect(result?.isAvailable).toBe(false);
  });
});