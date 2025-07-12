import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: false,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

swapSchema.index({ requesterId: 1, status: 1 });
swapSchema.index({ ownerId: 1, status: 1 });
swapSchema.index({ itemId: 1 });

export default mongoose.model('Swap', swapSchema);
