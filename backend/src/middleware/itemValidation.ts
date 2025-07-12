import { Request, Response, NextFunction } from 'express';

export const validateItemCreation = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, category, type, size, condition, tags } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || typeof description !== 'string' || description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'].includes(category)) {
    errors.push('Invalid category');
  }

  if (!['XS', 'S', 'M', 'L', 'XL', 'XXL'].includes(size)) {
    errors.push('Invalid size');
  }

  if (!['new', 'excellent', 'good', 'fair'].includes(condition)) {
    errors.push('Invalid condition');
  }

  if (tags && (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string'))) {
    errors.push('Tags must be an array of strings');
  }

  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    errors.push('At least one image is required');
  }

  if (errors.length > 0) {
    res.status(400).json({ message: 'Validation failed', errors });
    return;
  }

  next();
};
