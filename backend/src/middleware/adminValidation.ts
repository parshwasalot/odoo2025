import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const validateItemModeration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const errors: string[] = [];

    if (!Types.ObjectId.isValid(id)) {
      errors.push('Invalid item ID');
    }

    if (req.method === 'PUT' && req.path.includes('reject')) {
      if (!reason || typeof reason !== 'string' || reason.length < 1) {
        errors.push('Rejection reason is required');
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating moderation request' });
  }
};
