import { OrderService } from '../../../services/order.service';
import { OrderRepository } from '../../../repositories/order.repository';
import NotificationModel from '../../../models/notification.model';
import { UserModel } from '../../../models/user.model';
import { CreateOrderDto, UpdateOrderStatusDto } from '../../../dtos/order.dto';

jest.mock('../../../repositories/order.repository');
jest.mock('../../../models/notification.model');
jest.mock('../../../models/user.model');

describe('OrderService Unit Tests', () => {
  const mockOrder = {
    _id: 'order123456',
    user: { _id: 'user123', email: 'user@test.com' },
    items: [],
    total: 100,
    status: 'confirmed',
    deliveryOption: 'pickup',
    timeOption: 'asap',
    scheduledTime: null,
    paymentMethod: 'cod',
    customerDetails: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createOrder should create order and send notifications', async () => {
    const orderDto: CreateOrderDto = {
      items: [],
      total: 100,
      deliveryOption: 'pickup',
      timeOption: 'asap',
      scheduledTime: null,
      paymentMethod: 'cod',
      customerDetails: {},
    };

    // Mock repository
    (OrderRepository.create as jest.Mock).mockResolvedValue(mockOrder);
    (UserModel.find as jest.Mock).mockResolvedValue([{ _id: 'admin1' }]);
    (NotificationModel.create as jest.Mock).mockResolvedValue({});

    const result = await OrderService.createOrder('user123', orderDto);

    expect(OrderRepository.create).toHaveBeenCalledWith('user123', orderDto);
    expect(NotificationModel.create).toHaveBeenCalledTimes(2); // 1 user + 1 admin
    expect(result).toEqual(mockOrder);
  });

  it('getUserOrders should call repository', async () => {
    (OrderRepository.getUserOrders as jest.Mock).mockResolvedValue([mockOrder]);
    const result = await OrderService.getUserOrders('user123');
    expect(OrderRepository.getUserOrders).toHaveBeenCalledWith('user123');
    expect(result).toEqual([mockOrder]);
  });

  it('getAllOrders should call repository', async () => {
    (OrderRepository.getAllOrders as jest.Mock).mockResolvedValue([mockOrder]);
    const result = await OrderService.getAllOrders();
    expect(OrderRepository.getAllOrders).toHaveBeenCalled();
    expect(result).toEqual([mockOrder]);
  });

  it('updateOrderStatus should update status and send notifications', async () => {
    const statusDto: UpdateOrderStatusDto = { status: 'delivered' };

    (OrderRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrder });
    (OrderRepository.updateStatus as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'delivered' });
    (UserModel.find as jest.Mock).mockResolvedValue([{ _id: 'admin1' }]);
    (NotificationModel.create as jest.Mock).mockResolvedValue({});

    const result = await OrderService.updateOrderStatus('order123456', statusDto);

    expect(OrderRepository.findById).toHaveBeenCalledWith('order123456');
    expect(OrderRepository.updateStatus).toHaveBeenCalledWith('order123456', 'delivered');
    expect(NotificationModel.create).toHaveBeenCalledTimes(2); // 1 user + 1 admin
    expect(result.status).toBe('delivered');
  });

  it('updateOrderStatus should throw error if order not found', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue(null);
    await expect(OrderService.updateOrderStatus('nonexist', { status: 'delivered' })).rejects.toThrow('Order not found');
  });

  it('updateOrderStatus should throw error if status unchanged', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({ ...mockOrder });
    await expect(OrderService.updateOrderStatus('order123456', { status: 'confirmed' })).rejects.toThrow('Order is already confirmed');
  });
});