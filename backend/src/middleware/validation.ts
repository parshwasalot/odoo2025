import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .escape()
    .withMessage('Bio must not exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape()
    .withMessage('Location must not exceed 100 characters'),
  validate
];

export const validateAuth = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

export const validateItemCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape()
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .escape()
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'])
    .withMessage('Invalid category'),
  body('size')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
    .withMessage('Invalid size'),
  body('condition')
    .isIn(['new', 'excellent', 'good', 'fair'])
    .withMessage('Invalid condition'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  validate
];
