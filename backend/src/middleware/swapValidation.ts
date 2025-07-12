import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const validateSwapRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { itemId, message } = req.body;

    const errors: string[] = [];

    if (!itemId || !Types.ObjectId.isValid(itemId)) {
      errors.push('Valid item ID is required');
    }

    if (message !== undefined) {
      if (typeof message !== 'string') {
        errors.push('Message must be a string');
      } else if (message.length > 500) {
        errors.push('Message must not exceed 500 characters');
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating swap request' });
  }
};
