import { OrderRepository } from '../../../repositories/order.repository';
import { OrderModel } from '../../../models/order.model';
import { UserModel } from '../../../models/user.model';
import { CreateOrderDto } from '../../../dtos/order.dto';

describe('OrderRepository Unit Tests', () => {
  let userId: string;
  let orderId: string;

  const testUser = {
    email: 'orderuser@test.com',
    password: 'Password123!',
    role: 'user',
    fullName: 'Order User',
  };

  const testOrder: CreateOrderDto = {
    items: [{ name: 'Cappuccino', quantity: 2, price: 5 }],
    total: 10,
    deliveryOption: 'delivery',
    timeOption: 'asap',
    scheduledTime: new Date('2026-03-01T10:00:00Z'), 
    paymentMethod: 'cod',
    customerDetails: { fullName: 'Order User', phone: '1234567890' },
  };

  // Create user once before all tests
  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    const user = await UserModel.create(testUser);
    userId = user._id.toString();
  });

  // Clear orders and create a fresh order before each test
  beforeEach(async () => {
    await OrderModel.deleteMany({ user: userId });
    const order = await OrderRepository.create(userId, testOrder);
    orderId = order._id.toString();
  });

  // Clean up after all tests
  afterAll(async () => {
    await OrderModel.deleteMany({ user: userId });
    await UserModel.deleteMany({ email: testUser.email });
  });

  describe('create()', () => {
    it('should create a new order', async () => {
      const order = await OrderRepository.create(userId, testOrder);
      expect(order).toBeDefined();
      expect(order.user.toString()).toBe(userId);
      expect(order.items.length).toBe(1);
    });
  });

  describe('getUserOrders()', () => {
    it('should return orders for a user', async () => {
      const orders = await OrderRepository.getUserOrders(userId);
      expect(orders).toHaveLength(1);
      expect(orders[0]._id.toString()).toBe(orderId);
    });

    it('should return empty array if no orders', async () => {
      const orders = await OrderRepository.getUserOrders('507f1f77bcf86cd799439011');
      expect(orders).toHaveLength(0);
    });
  });

  describe('getAllOrders()', () => {
    it('should return all orders', async () => {
      const orders = await OrderRepository.getAllOrders();
      expect(orders.length).toBeGreaterThan(0);
      expect(orders[0]).toHaveProperty('user');
    });
  });

  describe('findById()', () => {
    it('should return order if exists', async () => {
      const order = await OrderRepository.findById(orderId);
      expect(order).not.toBeNull();
      expect(order?._id.toString()).toBe(orderId);
    });

    it('should return null if order does not exist', async () => {
      const order = await OrderRepository.findById('507f1f77bcf86cd799439011');
      expect(order).toBeNull();
    });
  });

  describe('updateStatus()', () => {
    it('should update order status', async () => {
      const updatedOrder = await OrderRepository.updateStatus(orderId, 'delivered');
      expect(updatedOrder.status).toBe('delivered');
    });

    it('should throw error if order not found', async () => {
      await expect(OrderRepository.updateStatus('507f1f77bcf86cd799439011', 'delivered'))
        .rejects.toThrow('Order not found');
    });
  });
});