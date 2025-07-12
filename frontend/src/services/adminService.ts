import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
adminApi.interceptors.request.use((config) => {
  // Check if admin session is active (PIN authenticated)
  const adminSession = localStorage.getItem('adminSession');
  if (adminSession === 'true') {
    // Use a special admin token header instead of user token
    config.headers['X-Admin-Session'] = 'true';
    config.headers['X-Admin-Pin'] = '123456'; // You can hash this for security
  }
  return config;
});

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  points: number;
  greenScore: number;
  isAdmin: boolean;
  isBlocked?: boolean;
  createdAt: string;
  itemsPosted?: number;
  swapsCompleted?: number;
}

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalSwaps: number;
  itemsByStatus: Array<{ _id: string; count: number }>;
  swapsByStatus: Array<{ _id: string; count: number }>;
  topUsers: Array<{
    name: string;
    points: number;
    greenScore: number;
  }>;
}

export const adminService = {
  // Get all users for admin panel
  async getUsers(page = 1, limit = 10, search = ''): Promise<{
    users: AdminUser[];
    total: number;
    pages: number;
    currentPage: number;
  }> {
    try {
      const response = await adminApi.get('/admin/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Update user status (block/unblock, admin privileges)
  async updateUserStatus(userId: string, updates: { isAdmin?: boolean; isBlocked?: boolean }): Promise<AdminUser> {
    try {
      const response = await adminApi.put(`/admin/users/${userId}/status`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Get platform statistics
  async getPlatformStats(): Promise<AdminStats> {
    try {
      const response = await adminApi.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  },

  // Get moderation queue
  async getModerationQueue(page = 1, limit = 10) {
    try {
      const response = await adminApi.get('/admin/moderation/items', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      throw error;
    }
  },

  // Approve item
  async approveItem(itemId: string) {
    try {
      const response = await adminApi.put(`/admin/moderation/items/${itemId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving item:', error);
      throw error;
    }
  },

  // Reject item
  async rejectItem(itemId: string, reason: string) {
    try {
      const response = await adminApi.put(`/admin/moderation/items/${itemId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting item:', error);
      throw error;
    }
  }
};

export default adminService;
