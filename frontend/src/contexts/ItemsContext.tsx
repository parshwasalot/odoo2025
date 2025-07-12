import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Item } from '../types';
import axios from 'axios';

interface ItemsContextType {
  items: Item[];
  loading: boolean;
  error: string | null;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  fetchItems: () => Promise<void>;
  handleAddItem: (itemData: Omit<Item, 'id' | 'userId' | 'userName' | 'userRating' | 'datePosted' | 'views' | 'isAvailable'>) => Promise<void>;
  handleViewItem: (item: Item) => Promise<void>;
}

export const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data.items);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddItem = async (itemData: any) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all item data
      Object.keys(itemData).forEach(key => {
        if (key === 'images') {
          itemData.images.forEach((image: File) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, itemData[key]);
        }
      });

      await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchItems();
    } catch (err) {
      setError('Failed to add item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = async (item: Item) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/items/${item.id}/view`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedItem(item);
    } catch (err) {
      console.error('Failed to update view count', err);
    }
  };

  const value = {
    items,
    loading,
    error,
    selectedItem,
    setSelectedItem,
    fetchItems,
    handleAddItem,
    handleViewItem
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};