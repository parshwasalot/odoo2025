import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Swap from '../models/Swap';
import Item from '../models/Item';
import User from '../models/User';
import PointsTransaction from '../models/PointsTransaction';

export const createSwap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, offeredItemId, message } = req.body;
    
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const requesterId = req.user.userId;

    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (item.uploaderId.toString() === requesterId.toString()) {
      res.status(400).json({ message: 'Cannot request swap for your own item' });
      return;
    }

    if (item.status !== 'available') {
      res.status(400).json({ message: 'Item is not available for swap' });
      return;
    }

    // Validate offered item if provided
    if (offeredItemId) {
      const offeredItem = await Item.findById(offeredItemId);
      if (!offeredItem) {
        res.status(404).json({ message: 'Offered item not found' });
        return;
      }
      
      if (offeredItem.uploaderId.toString() !== requesterId.toString()) {
        res.status(400).json({ message: 'You can only offer your own items' });
        return;
      }
      
      if (offeredItem.status !== 'available') {
        res.status(400).json({ message: 'Offered item is not available' });
        return;
      }
    }

    const swap = await Swap.create({
      itemId,
      requesterId,
      ownerId: item.uploaderId,
      offeredItemId: offeredItemId || undefined,
      message,
      status: 'pending'
    });

    // Update items status to reserved
    await Item.findByIdAndUpdate(itemId, { status: 'reserved' });
    if (offeredItemId) {
      await Item.findByIdAndUpdate(offeredItemId, { status: 'reserved' });
    }

    // Emit socket event for real-time notification
    req.app.get('io')?.to(item.uploaderId.toString()).emit('swap_request', {
      swap,
      item
    });

    res.status(201).json(swap);
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({ message: 'Error creating swap request' });
  }
};

export const getUserSwaps = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userId = req.user.userId;

    const [incomingSwaps, outgoingSwaps] = await Promise.all([
      Swap.find({ ownerId: userId })
        .populate('itemId', 'title images pointValue uploaderId')
        .populate('offeredItemId', 'title images pointValue uploaderId')
        .populate('requesterId', 'name email'),
      Swap.find({ requesterId: userId })
        .populate('itemId', 'title images pointValue uploaderId')
        .populate('offeredItemId', 'title images pointValue uploaderId')
        .populate('ownerId', 'name email')
    ]);

    res.json({ incomingSwaps, outgoingSwaps });
  } catch (error) {
    console.error('Error fetching swaps:', error);
    res.status(500).json({ message: 'Error fetching swaps' });
  }
};

export const acceptSwap = async (req: Request, res: Response): Promise<void> => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    if (swap.ownerId.toString() !== req.user?.userId.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (swap.status !== 'pending') {
      res.status(400).json({ message: 'Swap is not in pending status' });
      return;
    }

    swap.status = 'accepted';
    await swap.save();

    req.app.get('io').to(swap.requesterId.toString()).emit('swap_accepted', { swap });

    res.json(swap);
  } catch (error) {
    res.status(500).json({ message: 'Error accepting swap' });
  }
};

export const rejectSwap = async (req: Request, res: Response): Promise<void> => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    if (swap.ownerId.toString() !== req.user?.userId.toString()) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    swap.status = 'rejected';
    await swap.save();

    // Make items available again
    await Item.findByIdAndUpdate(swap.itemId, { status: 'available' });
    if (swap.offeredItemId) {
      await Item.findByIdAndUpdate(swap.offeredItemId, { status: 'available' });
    }

    req.app.get('io')?.to(swap.requesterId.toString()).emit('swap_rejected', { swap });

    res.json(swap);
  } catch (error) {
    console.error('Error rejecting swap:', error);
    res.status(500).json({ message: 'Error rejecting swap' });
  }
};

export const completeSwap = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      res.status(404).json({ message: 'Swap request not found' });
      return;
    }

    if (![swap.ownerId.toString(), swap.requesterId.toString()].includes(req.user?.userId.toString())) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    if (swap.status !== 'accepted') {
      res.status(400).json({ message: 'Swap must be accepted first' });
      return;
    }

    const session = await Swap.startSession();
    session.startTransaction();

    try {
      // Update swap status
      swap.status = 'completed';
      await swap.save({ session });

      // Update items status to swapped
      await Item.findByIdAndUpdate(
        swap.itemId,
        { status: 'swapped' },
        { session }
      );

      if (swap.offeredItemId) {
        await Item.findByIdAndUpdate(
          swap.offeredItemId,
          { status: 'swapped' },
          { session }
        );
      }

      // Award points to both users (10 points each for successful swap)
      await User.findByIdAndUpdate(
        swap.ownerId,
        { $inc: { points: 10 } },
        { session }
      );

      await User.findByIdAndUpdate(
        swap.requesterId,
        { $inc: { points: 10 } },
        { session }
      );

      // Create points transactions with ordered: true for session
      const pointsTransactions = await PointsTransaction.create([
        {
          userId: swap.ownerId,
          type: 'earned',
          amount: 10,
          reason: 'swap_completion',
          itemId: swap.itemId
        },
        {
          userId: swap.requesterId,
          type: 'earned',
          amount: 10,
          reason: 'swap_completion',
          itemId: swap.itemId
        }
      ], { session, ordered: true });

      await session.commitTransaction();
      
      req.app.get('io')?.to([swap.ownerId.toString(), swap.requesterId.toString()]).emit('swap_completed', { swap });

      res.json({ swap, pointsTransactions });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error completing swap:', error);
    res.status(500).json({ message: 'Error completing swap' });
  }
};
