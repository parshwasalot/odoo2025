import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import Item from '../models/Item';
import PointsTransaction from '../models/PointsTransaction';

export const redeemItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.points < 10) {
      res.status(400).json({ message: 'Insufficient points' });
      return;
    }

    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.status !== 'available') {
      res.status(400).json({ message: 'Item is not available for redemption' });
      return;
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      // Deduct points and create transaction
      await User.findByIdAndUpdate(
        userId,
        { $inc: { points: -10 } },
        { session }
      );

      await PointsTransaction.create([{
        userId: new Types.ObjectId(userId),
        type: 'spent',
        amount: 10,
        reason: 'item_redemption',
        itemId: new Types.ObjectId(itemId)
      }], { session });

      // Update item status
      await Item.findByIdAndUpdate(
        itemId,
        { status: 'reserved' },
        { session }
      );

      await session.commitTransaction();
      res.json({ message: 'Item redeemed successfully' });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error redeeming item' });
  }
};

export const getPointsHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?.userId;

    const transactions = await PointsTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('itemId', 'title images');

    const total = await PointsTransaction.countDocuments({ userId });

    res.json({
      transactions,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching points history' });
  }
};

export const adjustPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { userId, amount, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const session = await User.startSession();
    session.startTransaction();

    try {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { points: amount } },
        { session }
      );

      await PointsTransaction.create([{
        userId,
        type: amount > 0 ? 'earned' : 'spent',
        amount: Math.abs(amount),
        reason: 'admin_adjustment',
        itemId: null
      }], { session });

      await session.commitTransaction();
      res.json({ message: 'Points adjusted successfully' });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adjusting points' });
  }
};
