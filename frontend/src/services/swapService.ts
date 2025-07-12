import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface SwapRequest {
  _id: string;
  itemId: {
    _id: string;
    title: string;
    images: string[];
    pointValue: number;
    uploaderId: string;
  };
  requesterId: {
    _id: string;
    name: string;
    email: string;
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  offeredItemId?: {
    _id: string;
    title: string;
    images: string[];
    pointValue: number;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface SwapRequestCreate {
  itemId: string;
  offeredItemId?: string;
  message?: string;
}

export const swapService = {
  // Create a new swap request
  createSwapRequest: async (swapData: SwapRequestCreate): Promise<SwapRequest> => {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/api/swaps`,
      swapData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get all swap requests for the current user
  getUserSwaps: async (): Promise<{ incomingSwaps: SwapRequest[], outgoingSwaps: SwapRequest[] }> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/api/swaps`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Accept a swap request
  acceptSwap: async (swapId: string): Promise<SwapRequest> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/api/swaps/${swapId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Reject a swap request
  rejectSwap: async (swapId: string): Promise<SwapRequest> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/api/swaps/${swapId}/reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Complete a swap request
  completeSwap: async (swapId: string): Promise<SwapRequest> => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/api/swaps/${swapId}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};
