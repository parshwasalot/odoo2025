import { Request, Response } from 'express';
import Item from '../models/Item';

export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received create item request:', {
      body: req.body,
      files: req.files ? (req.files as Express.Multer.File[]).map(f => ({ 
        originalname: f.originalname, 
        mimetype: f.mimetype, 
        size: f.size 
      })) : 'No files',
      user: req.user ? { userId: req.user.userId, name: req.user.name } : 'No user'
    });

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      console.error('No files received');
      res.status(400).json({ message: 'No images provided' });
      return;
    }

    // Store file paths instead of buffers
    const imagePaths = files.map(file => file.path);
    const imageTypes = files.map(file => file.mimetype);

    if (!req.user?.name) {
      console.error('No user name found in request');
      res.status(400).json({ message: 'User name is required' });
      return;
    }

    // Parse tags if they exist
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
        console.log('Parsed tags:', tags);
      } catch (error) {
        console.warn('Failed to parse tags:', req.body.tags);
        tags = [];
      }
    }

    const itemData = {
      ...req.body,
      tags,
      images: imagePaths,
      imageTypes,
      uploaderId: req.user.userId,
      uploaderName: req.user.name,
      status: 'pending'
    };

    console.log('Creating item with data:', {
      ...itemData,
      images: `${imagePaths.length} images`,
      imageTypes: `${imageTypes.length} types`
    });

    const item = await Item.create(itemData);

    console.log('Item created successfully:', item._id);
    const itemWithUrls = item.toJSON();
    res.status(201).json(itemWithUrls);
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ 
      message: 'Error creating item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const items = await Item.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Item.countDocuments(query);

    res.json({
      items,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item' });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.uploaderId.toString() !== req.user?.userId.toString() && !req.user?.isAdmin) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item' });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.uploaderId.toString() !== req.user?.userId.toString() && !req.user?.isAdmin) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await Item.deleteOne({ _id: req.params.id });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item' });
  }
};

export const updateItemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'available', 'reserved', 'swapped'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating item status' });
  }
};
