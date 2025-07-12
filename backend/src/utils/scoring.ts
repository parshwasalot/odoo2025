import { Types } from 'mongoose';
import Item from '../models/Item';
import Swap from '../models/Swap';

export const calculateGreenScore = async (userId: Types.ObjectId): Promise<number> => {
  try {
    const [uploadedItems, successfulSwaps] = await Promise.all([
      Item.countDocuments({ 
        uploaderId: userId,
        status: 'approved'
      }),
      Swap.countDocuments({
        $or: [
          { requesterId: userId },
          { ownerId: userId }
        ],
        status: 'completed'
      })
    ]);

    return (uploadedItems + successfulSwaps) * 10;
  } catch (error) {
    console.error('Error calculating green score:', error);
    return 0;
  }
};
