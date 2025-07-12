import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  location: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  greenScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  // Additional fields for stats tracking
  totalSwaps: {
    type: Number,
    default: 0,
  },
  successfulSwaps: {
    type: Number,
    default: 0,
  },
  totalListings: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  city: {
    type: String,
    trim: true,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });
userSchema.index({ location: 1 });
userSchema.index({ city: 1 });

export default mongoose.model('User', userSchema);
