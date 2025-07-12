export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  pointValue: number;
  images: string[];
  userName: string;
  userId?: string;
  views: number;
  datePosted: Date | string;
  tags: string[];
  isAvailable: boolean;
  userRating?: number;
}

export interface FilterOptions {
  searchTerm: string;
  category: string;
  size: string;
  condition: string;
  minPoints?: number;
  maxPoints?: number;
}

// Add other existing types...
