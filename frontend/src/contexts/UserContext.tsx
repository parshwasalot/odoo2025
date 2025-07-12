import React, { createContext, useContext } from 'react';
import type { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  handleLogin: (userData: Omit<User, 'id'>) => void;
  handleLogout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};