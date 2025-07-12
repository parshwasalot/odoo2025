import { Request, Response, NextFunction } from 'express';

export const validateItemCreation = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Validating item creation with data:', req.body);
  console.log('Files received:', req.files ? {
    count: (req.files as Express.Multer.File[]).length,
    files: (req.files as Express.Multer.File[]).map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    }))
  } : 'No files');
  
  const { title, description, category, type, size, condition, pointValue } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  // Convert category to lowercase for validation and normalize
  const validCategories = ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'];
  const normalizedCategory = category ? category.toLowerCase() : '';
  if (!category || !validCategories.includes(normalizedCategory)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  if (!type || typeof type !== 'string' || type.trim().length < 2) {
    errors.push('Type is required and must be at least 2 characters');
  }

  const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  if (!size || !validSizes.includes(size.toUpperCase())) {
    errors.push(`Invalid size. Must be one of: ${validSizes.join(', ')}`);
  }

  const validConditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];
  if (!condition || !validConditions.includes(condition)) {
    errors.push(`Invalid condition. Must be one of: ${validConditions.join(', ')}`);
  }

  const numericPointValue = Number(pointValue);
  if (isNaN(numericPointValue) || numericPointValue < 1 || numericPointValue > 100) {
    errors.push('Point value must be between 1 and 100');
  }

  // Check for files more thoroughly
  const files = req.files as Express.Multer.File[];
  if (!files || !Array.isArray(files) || files.length === 0) {
    console.error('File validation failed:', { 
      hasFiles: !!req.files, 
      isArray: Array.isArray(req.files),
      length: files?.length || 0 
    });
    errors.push('At least one image is required');
  }

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    res.status(400).json({ 
      message: 'Validation failed', 
      errors,
      receivedData: {
        title,
        description,
        category,
        type,
        size,
        condition,
        pointValue,
        fileCount: files?.length || 0,
        hasFiles: !!(req.files && Array.isArray(req.files) && req.files.length > 0)
      }
    });
    return;
  }

  // Normalize data before proceeding
  req.body.category = normalizedCategory;
  req.body.size = size.toUpperCase();
  req.body.title = title.trim();
  req.body.description = description.trim();
  req.body.type = type.trim();
  
  console.log('Validation passed, normalized data:', {
    category: req.body.category,
    size: req.body.size,
    type: req.body.type
  });
  
  next();
};
