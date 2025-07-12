import React, { createContext, useContext } from 'react';
import type { Item } from '../types';

interface ItemsContextType {
  items: Item[];
  setItems: (items: Item[] | ((prev: Item[]) => Item[])) => void;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  handleAddItem: (itemData: Omit<Item, 'id' | 'userId' | 'userName' | 'userRating' | 'datePosted' | 'views' | 'isAvailable'>) => void;
  handleViewItem: (item: Item) => void;
}

export const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};