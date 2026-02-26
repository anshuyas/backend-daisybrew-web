import { authorized, isAdmin, AuthRequest } from '../../../middlewares/authorized.middleware';
import { UserModel } from '../../../models/user.model';
import jwt from 'jsonwebtoken';

jest.mock('../../../models/user.model');

describe('Middleware: authorized', () => {
  let req: Partial<AuthRequest>;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    await authorized(req as AuthRequest, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token missing' });
  });

  it('should call next() if token is valid', async () => {
    const fakeUser = { _id: '123', role: 'admin' };
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET as string);

    req.headers = { authorization: `Bearer ${token}` };

    // Mock findById().select() chain
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await authorized(req as AuthRequest, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
  });
});