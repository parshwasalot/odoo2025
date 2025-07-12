import React, { useState } from 'react';
import { Send, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useMessages } from '../contexts/MessagesContext';
import { useUser } from '../contexts/UserContext';

export const Messages: React.FC = () => {
  const { messages, swapRequests } = useMessages();
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  if (!currentUser) return null;

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const otherUserId = message.senderId === currentUser.id ? message.recipientId : message.senderId;
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  const userRequests = swapRequests.filter(
    request => request.requesterId === currentUser.id || 
    // In a real app, you'd check if the item belongs to the current user
    request.requesterId !== currentUser.id
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, you'd call the handleSendMessage from context
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages & Requests</h1>
          <p className="text-gray-600">
            Manage your conversations and swap requests
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'messages'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Messages ({Object.keys(conversations).length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Swap Requests ({userRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'messages' && (
              <div className="grid lg:grid-cols-3 gap-6 h-96">
                {/* Conversations List */}
                <div className="lg:col-span-1 border-r border-gray-200 pr-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Conversations</h3>
                  <div className="space-y-2">
                    {Object.keys(conversations).map(userId => {
                      const conversation = conversations[userId];
                      const lastMessage = conversation[conversation.length - 1];
                      const unreadCount = conversation.filter(m => !m.isRead && m.senderId !== currentUser.id).length;
                      
                      return (
                        <button
                          key={userId}
                          onClick={() => setSelectedConversation(userId)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedConversation === userId
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">User {userId}</div>
                              <div className="text-sm text-gray-600 truncate">{lastMessage.content}</div>
                            </div>
                            {unreadCount > 0 && (
                              <div className="w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    
                    {Object.keys(conversations).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>No conversations yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2">
                  {selectedConversation ? (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {conversations[selectedConversation].map(message => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                message.senderId === currentUser.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {message.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">Swap Requests</h3>
                
                {userRequests.length > 0 ? (
                  <div className="space-y-4">
                    {userRequests.map(request => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                request.status === 'declined' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {request.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {request.dateCreated.toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-2">
                              {request.requesterId === currentUser.id 
                                ? 'You requested to swap for item ' 
                                : 'Someone wants to swap for your item '
                              }
                              <strong>#{request.itemId}</strong>
                            </p>
                            
                            {request.offeredItemId && (
                              <p className="text-sm text-gray-600">
                                Offered item: #{request.offeredItemId}
                              </p>
                            )}
                            
                            {request.pointsOffered && (
                              <p className="text-sm text-gray-600">
                                Offered: {request.pointsOffered} points
                              </p>
                            )}
                          </div>

                          {request.status === 'pending' && request.requesterId !== currentUser.id && (
                            <div className="flex space-x-2">
                              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1">
                                <XCircle className="w-4 h-4" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No swap requests yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};