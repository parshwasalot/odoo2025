import mongoose from 'mongoose';

const pointsTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['earned', 'spent'],
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    enum: ['item_upload', 'item_redemption', 'swap_completion', 'admin_adjustment'],
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false,
  },
}, {
  timestamps: true,
});

pointsTransactionSchema.index({ userId: 1, type: 1 });
pointsTransactionSchema.index({ createdAt: -1 });

export default mongoose.model('PointsTransaction', pointsTransactionSchema);
