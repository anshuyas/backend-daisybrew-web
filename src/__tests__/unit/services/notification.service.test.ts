import { NotificationService } from '../../../services/notification.service';
import { AdminNotificationService } from '../../../services/admin/notification.service';
import { NotificationRepository } from '../../../repositories/notification.repository';
import { CreateNotificationDto } from '../../../dtos/notification.dto';

jest.mock('../../../repositories/notification.repository');

describe('NotificationService Unit Tests', () => {
  const mockNotification = {
    _id: 'notif123',
    user: 'user123',
    message: 'Test notification',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // User NotificationService tests
  it('getUserNotifications should call repository.getUserNotifications', async () => {
    (NotificationRepository.getUserNotifications as jest.Mock).mockResolvedValue([mockNotification]);

    const result = await NotificationService.getUserNotifications('user123');

    expect(NotificationRepository.getUserNotifications).toHaveBeenCalledWith('user123');
    expect(result).toEqual([mockNotification]);
  });

  it('markAsRead should call repository.markAsRead', async () => {
    (NotificationRepository.markAsRead as jest.Mock).mockResolvedValue({ ...mockNotification, read: true });

    const result = await NotificationService.markAsRead('notif123');

if (!result) {
  throw new Error('Notification not found');
}
    expect(result.read).toBe(true);
  });

  it('createNotification should call repository.create', async () => {
    const data: CreateNotificationDto = { message: 'Hello user!' };
    (NotificationRepository.create as jest.Mock).mockResolvedValue(mockNotification);

    const result = await NotificationService.createNotification('user123', data);

    expect(NotificationRepository.create).toHaveBeenCalledWith('user123', data);
    expect(result).toEqual(mockNotification);
  });

  // AdminNotificationService tests
  it('getAllNotificationsForAdmin should call repository.getAllForAdmin', async () => {
    (NotificationRepository.getAllForAdmin as jest.Mock).mockResolvedValue([mockNotification]);

    const result = await AdminNotificationService.getAllNotificationsForAdmin();

    expect(NotificationRepository.getAllForAdmin).toHaveBeenCalled();
    expect(result).toEqual([mockNotification]);
  });
});