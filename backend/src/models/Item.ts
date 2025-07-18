import mongoose from 'mongoose';
import path from 'path';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'dresses', 'shoes', 'accessories', 'outerwear'],
  },
  type: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair'],
  },
  images: [{
    type: String, // Changed from Buffer to String to store file paths
    required: true,
  }],
  imageTypes: [{
    type: String,
    required: true,
  }],
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploaderName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'available', 'reserved', 'swapped'],
    default: 'pending',
  },
  pointValue: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  brand: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  userRating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

// Add virtual for image URLs
itemSchema.virtual('imageUrls').get(function() {
  return this.images.map((imagePath: string) => {
    return `/uploads/items/${path.basename(imagePath)}`;
  });
});

itemSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret: { images?: any, imageTypes?: any }) {
    delete ret.images;
    delete ret.imageTypes;
    return ret;
  }
});

itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ uploaderId: 1 });
itemSchema.index({ tags: 1 });

export default mongoose.model('Item', itemSchema);
