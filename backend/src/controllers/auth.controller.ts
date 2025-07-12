import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    const token = generateToken({
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    res.status(201).json({
      token: token, // Don't add Bearer prefix here, let frontend handle it
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        points: user.points || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };

    console.log('Creating token for user:', {
      userId: user._id,
      email: user.email,
      name: user.name,
      timestamp: new Date().toISOString(),
    });

    const token = generateToken(tokenPayload);

    res.json({
      token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        points: user.points || 0,
      },
      meta: {
        loginTime: new Date().toISOString(),
        serverStatus: 'healthy',
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Check if it's a rate limiting issue
    if ((error as any).name === 'MongooseError' || (error as any).code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'Service temporarily unavailable',
        retryAfter: 30,
        type: 'service_unavailable',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check for rate limiting errors
    if ((error as any).status === 429 || (error as any).code === 'RATE_LIMIT_EXCEEDED') {
      res.status(429).json({
        message: 'Too many requests, please try again later',
        retryAfter: 60,
        type: 'rate_limit_exceeded',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(500).json({
      message: 'Error during login',
      type: 'server_error',
      timestamp: new Date().toISOString(),
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Profile request for user:', req.user?.userId, 'at', new Date().toISOString());

    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      ...user.toObject(),
      meta: {
        fetchTime: new Date().toISOString(),
        requestCount: req.headers['x-request-count'] || 1,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);

    // Handle potential rate limiting or connection issues
    if ((error as any)?.name === 'MongooseError' || (error as any)?.code === 'ECONNREFUSED') {
      res.status(503).json({
        message: 'Profile service temporarily unavailable',
        retryAfter: 15,
        type: 'service_unavailable',
      });
      return;
    }

    res.status(500).json({
      message: 'Error fetching profile',
      type: 'server_error',
      timestamp: new Date().toISOString(),
    });
  }
};
