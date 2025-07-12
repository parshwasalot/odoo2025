import React, { createContext, useContext } from 'react';
import type { Message, SwapRequest } from '../types';

interface MessagesContextType {
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  swapRequests: SwapRequest[];
  setSwapRequests: (requests: SwapRequest[] | ((prev: SwapRequest[]) => SwapRequest[])) => void;
  handleSendMessage: (recipientId: string, content: string) => void;
  handleSwapRequest: (itemId: string, offeredItemId?: string, points?: number) => void;
}

export const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};