import { authorized, isAdmin, AuthRequest } from '../../../middlewares/authorized.middleware';
import { UserModel } from '../../../models/user.model';
import jwt from 'jsonwebtoken';

jest.mock('../../../models/user.model');

describe('Middleware: authorized + isAdmin', () => {
  let req: Partial<AuthRequest>;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------- authorized tests ----------
  it('should return 401 if no token is provided', async () => {
    await authorized(req as AuthRequest, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token missing' });
  });

  it('should call next() and attach user if token is valid in header', async () => {
    const fakeUser = { _id: '123', role: 'admin' };
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET as string);

    req.headers = { authorization: `Bearer ${token}` };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await authorized(req as AuthRequest, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
  });

  it('should call next() and attach user if token is in cookies', async () => {
    const fakeUser = { _id: '123', role: 'admin' };
    const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET as string);

    req.cookies = { auth_token: token };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await authorized(req as AuthRequest, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(fakeUser);
  });

  it('should return 401 if user not found', async () => {
    const token = jwt.sign({ id: '999' }, process.env.JWT_SECRET as string);

    req.headers = { authorization: `Bearer ${token}` };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await authorized(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 401 if token verification fails', async () => {
    req.headers = { authorization: 'Bearer invalidtoken' };

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authorized(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
  });

  // ---------- isAdmin tests ----------
  it('should return 401 if user is missing', () => {
    isAdmin(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('should return 403 if user is not admin', () => {
    req.user = { _id: '123', role: 'user' } as any;

    isAdmin(req as AuthRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied, admin only' });
  });

  it('should call next() if user is admin', () => {
    req.user = { _id: '123', role: 'admin' } as any;

    isAdmin(req as AuthRequest, res, next);

    expect(next).toHaveBeenCalled();
  });
});