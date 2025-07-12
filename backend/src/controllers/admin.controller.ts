import { Request, Response } from 'express';
import User from '../models/User';
import Item from '../models/Item';
import Swap from '../models/Swap';
import { Types } from 'mongoose';

export const getModerationQueue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const items = await Item.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('uploaderId', 'name email');

    const total = await Item.countDocuments({ status: 'pending' });

    res.json({
      items,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching moderation queue' });
  }
};

export const approveItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'available' },
      { new: true }
    ).populate('uploaderId');

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Award points to the uploader
    await User.findByIdAndUpdate(item.uploaderId, {
      $inc: { points: 10 }
    });

    // Notify the uploader
    req.app.get('io').to(item.uploaderId.toString()).emit('item_approved', { item });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error approving item' });
  }
};

export const rejectItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('uploaderId');

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Notify the uploader
    req.app.get('io').to(item.uploaderId.toString()).emit('item_rejected', { 
      item,
      reason
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting item' });
  }
};

export const getPlatformStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [users, items, swaps] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Swap.countDocuments()
    ]);

    const itemsByStatus = await Item.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const swapsByStatus = await Swap.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(5)
      .select('name points greenScore');

    res.json({
      totalUsers: users,
      totalItems: items,
      totalSwaps: swaps,
      itemsByStatus,
      swapsByStatus,
      topUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform statistics' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = search 
      ? { 
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isAdmin } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
};
