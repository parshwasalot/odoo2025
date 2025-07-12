import { Request, Response } from 'express';
import User from '../models/User';
import Item from '../models/Item';
import Swap from '../models/Swap';
import { calculateGreenScore } from '../utils/scoring';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const greenScore = await calculateGreenScore(user._id);
    user.greenScore = greenScore;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, bio, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { name, bio, location },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.isAdmin) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.isAdmin = true;
    await user.save();

    res.json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user' });
  }
};
