import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Package, MessageCircle, User } from 'lucide-react';
import { swapService, SwapRequest } from '../services/swapService';

export const Swaps: React.FC = () => {
  const [swaps, setSwaps] = useState<{ incomingSwaps: SwapRequest[], outgoingSwaps: SwapRequest[] }>({
    incomingSwaps: [],
    outgoingSwaps: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const swapData = await swapService.getUserSwaps();
      setSwaps(swapData);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSwap = async (swapId: string) => {
    try {
      await swapService.acceptSwap(swapId);
      fetchSwaps(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept swap');
    }
  };

  const handleRejectSwap = async (swapId: string) => {
    try {
      await swapService.rejectSwap(swapId);
      fetchSwaps(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject swap');
    }
  };

  const handleCompleteSwap = async (swapId: string) => {
    try {
      await swapService.completeSwap(swapId);
      fetchSwaps(); // Refresh data
      alert('Swap completed successfully! You both earned 10 points.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete swap');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderSwapCard = (swap: SwapRequest, isIncoming: boolean) => {
    const otherUser = isIncoming ? swap.requesterId : swap.ownerId;
    const item = swap.itemId;
    const offeredItem = swap.offeredItemId;

    return (
      <div key={swap._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{otherUser.name}</h4>
              <p className="text-sm text-gray-600">{otherUser.email}</p>
            </div>
          </div>
          {getStatusBadge(swap.status)}
        </div>

        <div className="space-y-4">
          {/* Target Item */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={item.images?.[0] || '/placeholder-image.jpg'}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{item.title}</h5>
              <p className="text-sm text-gray-600">{item.pointValue} points</p>
              <p className="text-xs text-gray-500">
                {isIncoming ? 'Your item' : 'Requested item'}
              </p>
            </div>
          </div>

          {/* Offered Item */}
          {offeredItem && (
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <img
                src={offeredItem.images?.[0] || '/placeholder-image.jpg'}
                alt={offeredItem.title}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{offeredItem.title}</h5>
                <p className="text-sm text-gray-600">{offeredItem.pointValue} points</p>
                <p className="text-xs text-gray-500">
                  {isIncoming ? 'Offered item' : 'Your offered item'}
                </p>
              </div>
            </div>
          )}

          {/* Message */}
          {swap.message && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-700">{swap.message}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {isIncoming && swap.status === 'pending' && (
              <>
                <button
                  onClick={() => handleAcceptSwap(swap._id)}
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectSwap(swap._id)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            
            {swap.status === 'accepted' && (
              <button
                onClick={() => handleCompleteSwap(swap._id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {new Date(swap.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const currentSwaps = activeTab === 'incoming' ? swaps.incomingSwaps : swaps.outgoingSwaps;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'incoming' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Incoming Requests ({swaps.incomingSwaps.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
            activeTab === 'outgoing' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sent Requests ({swaps.outgoingSwaps.length})
        </button>
      </div>

      {currentSwaps.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab === 'incoming' ? 'incoming' : 'sent'} swap requests
          </h3>
          <p className="text-gray-600">
            {activeTab === 'incoming' 
              ? 'When someone requests to swap with your items, they will appear here.'
              : 'Your swap requests to other users will appear here.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {currentSwaps.map(swap => renderSwapCard(swap, activeTab === 'incoming'))}
        </div>
      )}
    </div>
  );
};
