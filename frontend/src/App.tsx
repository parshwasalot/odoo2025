import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { BrowseItems } from './components/BrowseItems';
import { ItemDetail } from './components/ItemDetail';
import { AddItem } from './components/AddItem';
import { Messages } from './components/Messages';
import { SocialImpactDashboard } from './components/SocialImpactDashboard';
import { UserContext } from './contexts/UserContext';
import { ItemsContext } from './contexts/ItemsContext';
import { MessagesContext } from './contexts/MessagesContext';
import type { User, Item, Message, SwapRequest } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  // Load initial data
  useEffect(() => {
    // Mock initial items
    const mockItems: Item[] = [
      {
        id: '1',
        title: 'Vintage Denim Jacket',
        description: 'Beautiful vintage Levi\'s denim jacket in excellent condition. Perfect for sustainable fashion lovers.',
        category: 'Outerwear',
        size: 'M',
        condition: 'Excellent',
        pointValue: 45,
        images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
        userId: 'user1',
        userName: 'Sarah Green',
        userRating: 4.8,
        datePosted: new Date('2024-01-15'),
        views: 124,
        isAvailable: true,
        tags: ['vintage', 'denim', 'sustainable']
      },
      {
        id: '2',
        title: 'Designer Summer Dress',
        description: 'Elegant summer dress from sustainable fashion brand. Worn only twice, perfect for special occasions.',
        category: 'Dresses',
        size: 'S',
        condition: 'Like New',
        pointValue: 60,
        images: ['https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg'],
        userId: 'user2',
        userName: 'Emma Wilson',
        userRating: 4.9,
        datePosted: new Date('2024-01-20'),
        views: 89,
        isAvailable: true,
        tags: ['designer', 'summer', 'elegant']
      },
      {
        id: '3',
        title: 'Organic Cotton T-Shirt',
        description: 'Soft organic cotton t-shirt in pristine condition. Great basic piece for any wardrobe.',
        category: 'Tops',
        size: 'L',
        condition: 'New',
        pointValue: 25,
        images: ['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'],
        userId: 'user3',
        userName: 'Mike Johnson',
        userRating: 4.7,
        datePosted: new Date('2024-01-22'),
        views: 56,
        isAvailable: true,
        tags: ['organic', 'cotton', 'basic']
      }
    ];
    setItems(mockItems);
  }, []);

  const handleLogin = (userData: Omit<User, 'id'>) => {
    const user: User = {
      id: Date.now().toString(),
      ...userData,
      points: 150,
      rating: 4.8,
      itemsPosted: 3,
      swapsCompleted: 7,
      joinDate: new Date(),
      bio: 'Passionate about sustainable fashion and reducing textile waste.'
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleAddItem = (itemData: Omit<Item, 'id' | 'userId' | 'userName' | 'userRating' | 'datePosted' | 'views' | 'isAvailable'>) => {
    if (!currentUser) return;
    
    const newItem: Item = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRating: currentUser.rating,
      datePosted: new Date(),
      views: 0,
      isAvailable: true,
      ...itemData
    };
    
    setItems(prev => [newItem, ...prev]);
    setCurrentPage('dashboard');
  };

  const handleViewItem = (item: Item) => {
    setSelectedItem(item);
    setCurrentPage('item-detail');
    // Increment view count
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, views: i.views + 1 } : i
    ));
  };

  const handleSendMessage = (recipientId: string, content: string) => {
    if (!currentUser) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      recipientId,
      content,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, message]);
  };

  const handleSwapRequest = (itemId: string, offeredItemId?: string, points?: number) => {
    if (!currentUser) return;
    
    const request: SwapRequest = {
      id: Date.now().toString(),
      requesterId: currentUser.id,
      itemId,
      offeredItemId,
      pointsOffered: points,
      status: 'pending',
      dateCreated: new Date()
    };
    
    setSwapRequests(prev => [...prev, request]);
  };

  const userContextValue = {
    currentUser,
    setCurrentUser,
    handleLogin,
    handleLogout
  };

  const itemsContextValue = {
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    handleAddItem,
    handleViewItem
  };

  const messagesContextValue = {
    messages,
    setMessages,
    swapRequests,
    setSwapRequests,
    handleSendMessage,
    handleSwapRequest
  };

  return (
    <UserContext.Provider value={userContextValue}>
      <ItemsContext.Provider value={itemsContextValue}>
        <MessagesContext.Provider value={messagesContextValue}>
          <div className="min-h-screen bg-gray-50">
            <Header 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setIsAuthModalOpen={setIsAuthModalOpen}
            />
            
            <main>
              {currentPage === 'home' && <LandingPage setCurrentPage={setCurrentPage} />}
              {currentPage === 'browse' && <BrowseItems />}
              {currentPage === 'dashboard' && currentUser && <Dashboard />}
              {currentPage === 'impact' && currentUser && <SocialImpactDashboard />}
              {currentPage === 'add-item' && currentUser && <AddItem />}
              {currentPage === 'item-detail' && selectedItem && <ItemDetail />}
              {currentPage === 'messages' && currentUser && <Messages />}
            </main>

            <AuthModal 
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        </MessagesContext.Provider>
      </ItemsContext.Provider>
    </UserContext.Provider>
  );
}

export default App;