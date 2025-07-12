import { Request, Response } from 'express';
import User from '../models/User';
import Item from '../models/Item';
import Swap from '../models/Swap';
import { calculateGreenScore } from '../utils/scoring';
import { Types } from 'mongoose';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    console.log('Getting profile for user:', userId); // Debug log
    
    if (!userId) {
      console.log('No userId in request'); // Debug log
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('User not found in database:', userId); // Debug log
      res.status(404).json({ message: 'User not found' });
      return;
    }

    console.log('User found:', user.name, user.email); // Debug log

    // Calculate additional user stats using correct field names
    const itemsPosted = await Item.countDocuments({ uploaderId: new Types.ObjectId(userId) });
    const swapsCompleted = await Swap.countDocuments({ 
      $or: [
        { requesterId: new Types.ObjectId(userId), status: 'completed' },
        { ownerId: new Types.ObjectId(userId), status: 'completed' }
      ]
    });

    const greenScore = await calculateGreenScore(new Types.ObjectId(userId));
    user.greenScore = greenScore;
    await user.save();

    const userWithStats = {
      ...user.toObject(),
      itemsPosted,
      swapsCompleted,
      rating: 4.5 // TODO: Calculate real rating from swap feedback
    };

    res.json(userWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const getUserItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    console.log('Getting items for user:', userId); // Debug log
    
    if (!userId) {
      console.log('No userId in request for items'); // Debug log
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Get user's items using the correct field name from Item model
    const items = await Item.find({ uploaderId: userObjectId }).sort({ createdAt: -1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user items' });
  }
};

export const getUserActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    console.log('Getting activities for user:', userId); // Debug log
    
    if (!userId) {
      console.log('No userId in request for activities'); // Debug log
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Get recent items with their actual data
    const recentItems = await Item.find({ uploaderId: userObjectId }).sort({ createdAt: -1 }).limit(5);
    
    // Get recent swaps with populated item data - using correct field names
    const recentSwaps = await Swap.find({ 
      $or: [{ requesterId: userObjectId }, { ownerId: userObjectId }] 
    }).populate('itemId', 'title').sort({ createdAt: -1 }).limit(5);

    const activities = [
      ...recentItems.map(item => ({
        id: item._id.toString(),
        action: 'Listed new item',
        item: item.title,
        time: getTimeAgo(item.createdAt),
        type: 'success' as const,
        timestamp: item.createdAt
      })),
      ...recentSwaps.map(swap => {
        // Handle populated itemId properly - it could be an ObjectId or populated Item
        const swapItem = (swap.itemId && typeof swap.itemId === 'object' && 'title' in swap.itemId) 
          ? (swap.itemId as any).title 
          : 'Fashion item';
        const isRequester = swap.requesterId.toString() === userId;
        return {
          id: swap._id.toString(),
          action: swap.status === 'completed' ? 'Completed swap' : 
                  swap.status === 'pending' && !isRequester ? 'Received swap request' : 
                  swap.status === 'pending' && isRequester ? 'Sent swap request' :
                  swap.status === 'accepted' ? 'Swap accepted' : 'Swap request',
          item: swapItem,
          time: getTimeAgo(swap.createdAt),
          type: swap.status === 'completed' ? 'success' as const : 'info' as const,
          timestamp: swap.createdAt
        };
      })
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    // Remove timestamp from response
    const activitiesResponse = activities.map(({ timestamp, ...activity }) => activity);

    res.json(activitiesResponse);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
};

export const getUserImpact = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    
    // Calculate user's environmental impact using correct field names
    const completedSwaps = await Swap.countDocuments({ 
      $or: [{ requesterId: userObjectId }, { ownerId: userObjectId }],
      status: 'completed'
    });

    const itemsRescued = await Item.countDocuments({ 
      uploaderId: userObjectId,
      status: 'swapped'
    });

    // Environmental impact calculations (simplified)
    const co2PerItem = 2.1; // kg CO2 saved per item swap
    const waterPerItem = 400; // liters saved per item
    const wastePerItem = 0.4; // kg waste diverted per item

    const impact = {
      co2Saved: completedSwaps * co2PerItem,
      waterConserved: completedSwaps * waterPerItem,
      wasteReduced: completedSwaps * wastePerItem,
      itemsRescued: itemsRescued
    };

    const greenScore = await calculateGreenScore(userObjectId);
    
    // Determine level based on green score
    let level = 'Beginner';
    let nextLevelPoints = 100 - greenScore;
    
    if (greenScore >= 80) {
      level = 'Planet Hero';
      nextLevelPoints = 0;
    } else if (greenScore >= 60) {
      level = 'Sustainability Champion';
      nextLevelPoints = 80 - greenScore;
    } else if (greenScore >= 40) {
      level = 'Eco-Warrior';
      nextLevelPoints = 60 - greenScore;
    } else if (greenScore >= 20) {
      level = 'Green Learner';
      nextLevelPoints = 40 - greenScore;
    }

    // Calculate achievements
    const achievements = [];
    if (completedSwaps >= 1) achievements.push('First Swap Completed');
    if (impact.waterConserved >= 1000) achievements.push('Water Saver (1000L+)');
    if (impact.co2Saved >= 10) achievements.push('CO2 Reducer (10kg+)');
    if (itemsRescued >= 5) achievements.push('Community Builder');

    const greenScoreData = {
      score: greenScore,
      level,
      nextLevelPoints,
      achievements
    };

    res.json({
      impact,
      greenScore: greenScoreData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching impact data' });
  }
};

export const getCommunityImpact = async (req: Request, res: Response): Promise<void> => {
  try {
    // For demo purposes, using simplified city data
    // In a real app, you'd determine user's city and calculate real metrics
    
    const totalUsers = await User.countDocuments();
    const totalSwaps = await Swap.countDocuments({ status: 'completed' });
    
    // Environmental impact calculations for community
    const co2PerItem = 2.1;
    const waterPerItem = 400;
    const wastePerItem = 0.4;
    
    const communityImpact = {
      co2Saved: totalSwaps * co2PerItem,
      waterConserved: totalSwaps * waterPerItem,
      wasteReduced: totalSwaps * wastePerItem,
      itemsRescued: totalSwaps
    };

    const cityMetrics = {
      cityName: 'Your City', // TODO: Get from user location
      totalUsers,
      totalSwaps,
      environmentalImpact: communityImpact,
      ranking: 1, // TODO: Calculate real ranking
      topCities: [
        {
          name: 'San Francisco',
          impact: {
            co2Saved: communityImpact.co2Saved * 1.2,
            waterConserved: communityImpact.waterConserved * 1.2,
            wasteReduced: communityImpact.wasteReduced * 1.2,
            itemsRescued: communityImpact.itemsRescued * 1.2
          },
          ranking: 1
        }
        // Add more cities as needed
      ]
    };

    res.json(cityMetrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community impact' });
  }
};

export const getGlobalImpact = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSwaps = await Swap.countDocuments({ status: 'completed' });
    const totalItems = await Item.countDocuments();
    
    // Global environmental impact calculations
    const co2PerItem = 2.1;
    const waterPerItem = 400;
    const wastePerItem = 0.4;
    
    const globalImpact = {
      co2Saved: totalSwaps * co2PerItem,
      waterConserved: totalSwaps * waterPerItem,
      wasteReduced: totalSwaps * wastePerItem,
      itemsRescued: totalSwaps
    };

    res.json({
      impact: globalImpact,
      totalUsers,
      totalSwaps,
      totalItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global impact' });
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { name, bio, location } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
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
