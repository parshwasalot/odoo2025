import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name: string;
        isAdmin: boolean;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header received:', authHeader ? 'exists' : 'missing'); // Debug log

    if (!authHeader) {
      console.log('No authorization header'); // Debug log
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('Token extracted:', token ? 'exists' : 'missing'); // Debug log

    if (!token) {
      console.log('No token provided'); // Debug log
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
      name: string;
      isAdmin: boolean;
    };

    console.log('Token decoded successfully for user:', decoded.userId); // Debug log
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// PIN-based admin authentication for admin panel
export const authenticateAdminPin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminSession = req.headers['x-admin-session'];
    const adminPin = req.headers['x-admin-pin'];

    console.log('Admin session header:', adminSession);
    console.log('Admin PIN header:', adminPin ? 'provided' : 'missing');

    if (adminSession !== 'true' || adminPin !== '123456') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Set a mock admin user for the request
    req.user = {
      userId: 'admin',
      name: 'Admin User',
      isAdmin: true
    };

    next();
  } catch (error) {
    console.error('Admin PIN auth error:', error);
    return res.status(401).json({ message: 'Admin authentication failed' });
  }
};
