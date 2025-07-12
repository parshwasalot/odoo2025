import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
}

interface SwapRequest {
  id: string;
  itemId: string;
  offeredItemId?: string;
  points?: number;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MessagesContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  swapRequests: SwapRequest[];
  setSwapRequests: (requests: SwapRequest[] | ((prev: SwapRequest[]) => SwapRequest[])) => void;
  handleSendMessage: (recipientId: string, content: string) => void;
  handleSwapRequest: (itemId: string, offeredItemId?: string, points?: number) => void;
}

export const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);

  const handleSendMessage = (recipientId: string, content: string) => {
    // Implementation for sending a message
  };

  const handleSwapRequest = (itemId: string, offeredItemId?: string, points?: number) => {
    // Implementation for handling a swap request
  };

  return (
    <MessagesContext.Provider value={{ messages, setMessages, swapRequests, setSwapRequests, handleSendMessage, handleSwapRequest }}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};