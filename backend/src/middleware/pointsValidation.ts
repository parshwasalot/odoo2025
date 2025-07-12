import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const validatePointsRedemption = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { itemId } = req.body;

    const errors: string[] = [];

    if (!itemId || !Types.ObjectId.isValid(itemId)) {
      errors.push('Valid item ID is required');
    }

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error validating points redemption' });
  }
};
