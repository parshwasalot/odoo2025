import User from '../models/User';
import PointsTransaction from '../models/PointsTransaction';
import { Types } from 'mongoose';

export const awardPoints = async (
  userId: string | Types.ObjectId,
  amount: number,
  reason: 'item_upload' | 'item_redemption' | 'swap_completion' | 'admin_adjustment',
  itemId?: string | Types.ObjectId
): Promise<void> => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    // Update user points
    await User.findByIdAndUpdate(
      userId,
      { $inc: { points: amount } },
      { session }
    );

    // Create points transaction
    await PointsTransaction.create([{
      userId: new Types.ObjectId(userId.toString()),
      type: amount > 0 ? 'earned' : 'spent',
      amount: Math.abs(amount),
      reason,
      itemId: itemId ? new Types.ObjectId(itemId.toString()) : undefined
    }], { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
