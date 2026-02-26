import { isAdmin } from '../../../middlewares/admin.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Middleware: isAdmin', () => {
  let req: any = {};
let res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
let next = jest.fn();

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if req.user is missing', () => {
    isAdmin(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
  });

  it('should return 403 if user is not admin', () => {
    req.user = { role: 'user' };

    isAdmin(req, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admin only.' });
  });

  it('should call next() if user is admin', () => {
    req.user = { role: 'admin' };

    isAdmin(req, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should handle exceptions and return 500', () => {
    // Force an error
    req.user = null;
    const faultyNext = () => { throw new Error('Test error'); };

    isAdmin(req, res as Response, faultyNext);
  });
});