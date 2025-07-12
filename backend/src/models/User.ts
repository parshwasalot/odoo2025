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
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });

export default mongoose.model('User', userSchema);
