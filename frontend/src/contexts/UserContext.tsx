import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  points: number;
  bio?: string;
  location?: string;
  greenScore?: number;
  itemsPosted?: number;
  swapsCompleted?: number;
  rating?: number;
  joinDate?: Date;
}

interface UserContextType {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  handleLogin: (user: User, token: string) => void;
  handleLogout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshingRef = useRef(false);
  const initializedRef = useRef(false);

  // Initialize from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Initializing user context:', { savedToken: !!savedToken, savedUser: !!savedUser });
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser({
          ...user,
          id: user.id?.toString(), // Ensure ID is always a string
          joinDate: user.joinDate ? new Date(user.joinDate) : new Date()
        });
        // Don't automatically refresh on initialization to prevent rate limiting
        console.log('User loaded from localStorage, skipping automatic refresh');
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    initializedRef.current = true;
  }, []);

  const refreshUserData = async (authToken: string) => {
    if (refreshingRef.current) {
      console.log('Profile refresh already in progress, skipping');
      return;
    }

    refreshingRef.current = true;
    
    try {
      console.log('Refreshing user data with token:', authToken ? 'exists' : 'missing');
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.error('Token expired or invalid, logging out user');
        handleLogout();
        return;
      }

      if (response.status === 429) {
        console.warn('Rate limited when refreshing profile, will retry later');
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        const updatedUser = {
          id: userData._id?.toString(), // Ensure ID is always a string
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
          points: userData.points || 0,
          bio: userData.bio,
          location: userData.location,
          greenScore: userData.greenScore || 0,
          itemsPosted: userData.itemsPosted || 0,
          swapsCompleted: userData.swapsCompleted || 0,
          rating: userData.rating || 0,
          joinDate: userData.createdAt ? new Date(userData.createdAt) : new Date()
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('User profile refreshed successfully');
      } else {
        console.error('Failed to refresh user data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      refreshingRef.current = false;
    }
  };

  const refreshUser = useCallback(async () => {
    if (token && !refreshingRef.current && initializedRef.current) {
      await refreshUserData(token);
    } else {
      console.warn('Cannot refresh user data:', { 
        hasToken: !!token, 
        isRefreshing: refreshingRef.current,
        isInitialized: initializedRef.current
      });
    }
  }, [token]);

  const handleLogin = useCallback((user: User, token: string) => {
    console.log('Logging in user:', user.name, 'with token:', token ? 'exists' : 'missing');
    setCurrentUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    console.log('Logging out user');
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [currentUser]);

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      token, 
      loading, 
      handleLogin, 
      handleLogout, 
      updateUser, 
      refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};