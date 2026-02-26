import { NotificationRepository } from '../../../repositories/notification.repository';
import NotificationModel from '../../../models/notification.model';
import { UserModel } from '../../../models/user.model';

describe('NotificationRepository Unit Tests', () => {
  let userId: string;
  let notificationId: string;

  const testUser = { email: 'notifyuser@test.com', password: 'Password123!', role: 'user', fullName: 'Notify User' };

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });
    const user = await UserModel.create(testUser);
    userId = user._id.toString();
    await NotificationModel.deleteMany({ user: userId });
  });

  afterAll(async () => {
    await NotificationModel.deleteMany({ user: userId });
    await UserModel.deleteMany({ email: testUser.email });
  });

  describe('create()', () => {
    it('should create a notification', async () => {
      const notif = await NotificationRepository.create(userId, { message: 'Test notification' });
      expect(notif).toBeDefined();
      expect(notif.message).toBe('Test notification');
      notificationId = notif._id.toString();
    });
  });

  describe('getUserNotifications()', () => {
    it('should return notifications for a user', async () => {
      const notifications = await NotificationRepository.getUserNotifications(userId);
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].user.toString()).toBe(userId);
    });

    it('should return empty array if user has no notifications', async () => {
      const notifications = await NotificationRepository.getUserNotifications('507f1f77bcf86cd799439011');
      expect(notifications).toHaveLength(0);
    });
  });

  describe('markAsRead()', () => {
    it('should mark notification as read', async () => {
      const updated = await NotificationRepository.markAsRead(notificationId);
      expect(updated).not.toBeNull();
      expect(updated?.read).toBe(true);
    });
  });

  describe('getAllForAdmin()', () => {
    it('should return all notifications with populated user', async () => {
      const allNotifications = await NotificationRepository.getAllForAdmin();
      expect(allNotifications.length).toBeGreaterThan(0);
      expect(allNotifications[0]).toHaveProperty('user');
    });
  });
});