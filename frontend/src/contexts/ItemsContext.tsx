import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Item } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

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
      const response = await axios.get(`${API_URL}/api/items`, {
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
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Preparing form data for submission...');
      console.log('Item data received:', { ...itemData, images: `${itemData.images?.length || 0} files` });
      
      const formData = new FormData();
      
      // Handle images first - these must be File objects
      if (itemData.images && itemData.images.length > 0) {
        itemData.images.forEach((file: File, index: number) => {
          if (file instanceof File) {
            formData.append('images', file);
            console.log(`Added image ${index + 1}:`, file.name, file.type, file.size);
          } else {
            console.error(`Image ${index + 1} is not a File object:`, typeof file);
          }
        });
      }

      // Append remaining data with proper formatting
      Object.keys(itemData).forEach(key => {
        if (key !== 'images' && itemData[key] !== undefined && itemData[key] !== '') {
          if (Array.isArray(itemData[key])) {
            // For arrays like tags, append as JSON if not empty
            if (itemData[key].length > 0) {
              formData.append(key, JSON.stringify(itemData[key]));
            }
          } else {
            formData.append(key, itemData[key].toString());
          }
        }
      });

      // Log FormData contents for debugging
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Using auth token:', authToken.substring(0, 20) + '...');

      const response = await axios.post(
        `${API_URL}/api/items`, 
        formData, 
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Server response:', response.data);
      setItems(prev => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      console.error('Error in handleAddItem:', err);
      console.error('Response data:', err.response?.data);
      if (err.response?.status === 401) {
        console.log('Token validation failed:', err.response.data);
        if (err.response.data.message === 'Invalid token') {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
      }
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = async (item: Item) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/items/${item.id}/view`, null, {
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