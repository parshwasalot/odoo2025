export interface Item {
  id: string | number;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  pointValue: number;
  images: string[];
  userName: string;
  userId?: string | number;
  views: number;
  datePosted: Date;
  tags: string[];
  isAvailable: boolean;
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
