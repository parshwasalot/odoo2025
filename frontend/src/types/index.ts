export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  rating: number;
  itemsPosted: number;
  swapsCompleted: number;
  joinDate: Date;
  bio?: string;
  preferences?: {
    categories: string[];
    sizes: string[];
    notifications: boolean;
  };
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: 'New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';
  pointValue: number;
  images: string[];
  userId: string;
  userName: string;
  userRating: number;
  datePosted: Date;
  views: number;
  isAvailable: boolean;
  tags: string[];
  brand?: string;
  material?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  itemId?: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  itemId: string;
  offeredItemId?: string;
  pointsOffered?: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  dateCreated: Date;
  message?: string;
}

export interface FilterOptions {
  category?: string;
  size?: string;
  condition?: string;
  minPoints?: number;
  maxPoints?: number;
  searchTerm?: string;
}

export interface EnvironmentalImpact {
  co2Saved: number; // in kg
  waterConserved: number; // in liters
  wasteReduced: number; // in kg
  itemsRescued: number;
}

export interface GreenScore {
  score: number; // 0-100
  level: 'Beginner' | 'Eco-Warrior' | 'Sustainability Champion' | 'Planet Hero';
  nextLevelPoints: number;
  achievements: string[];
}

export interface CityMetrics {
  cityName: string;
  totalUsers: number;
  totalSwaps: number;
  environmentalImpact: EnvironmentalImpact;
  ranking: number;
  topCities: Array<{
    name: string;
    impact: EnvironmentalImpact;
    ranking: number;
  }>;
}