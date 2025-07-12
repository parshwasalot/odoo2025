import React, { useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Star, Eye, Calendar, Package, Repeat } from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useUser } from '../contexts/UserContext';
import { useMessages } from '../contexts/MessagesContext';

export const ItemDetail: React.FC = () => {
  const { selectedItem, items } = useItems();
  const { currentUser } = useUser();
  const { handleSwapRequest, handleSendMessage } = useMessages();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedOfferItem, setSelectedOfferItem] = useState<string>('');
  const [message, setMessage] = useState('');

  if (!selectedItem) return null;

  const userItems = currentUser ? items.filter(item => item.userId === currentUser.id && item.id !== selectedItem.id) : [];

  const handleSwap = () => {
    if (!currentUser) return;
    
    if (selectedOfferItem) {
      handleSwapRequest(selectedItem.id, selectedOfferItem);
    } else if (currentUser.points >= selectedItem.pointValue) {
      handleSwapRequest(selectedItem.id, undefined, selectedItem.pointValue);
    }
    
    if (message) {
      handleSendMessage(selectedItem.userId, message);
    }
    
    setShowSwapModal(false);
    alert('Swap request sent successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Browse</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden">
              <img
                src={selectedItem.images[selectedImage]}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            {selectedItem.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {selectedItem.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-emerald-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedItem.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedItem.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <span className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{selectedItem.category}</span>
                </span>
                <span>Size {selectedItem.size}</span>
                <span>{selectedItem.condition}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{selectedItem.pointValue}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedItem.views}</div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedItem.userRating}</div>
                <div className="text-xs text-gray-600">Seller Rating</div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {selectedItem.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedItem.userName}</div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedItem.userRating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {selectedItem.datePosted.toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {currentUser && currentUser.id !== selectedItem.userId ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Repeat className="w-5 h-5" />
                  <span>Request Swap</span>
                </button>
                <button
                  onClick={() => handleSendMessage(selectedItem.userId, `Hi! I'm interested in your ${selectedItem.title}.`)}
                  className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </div>
            ) : !currentUser ? (
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <p className="text-gray-600 mb-3">Sign in to request a swap or send a message</p>
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                  Sign In
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <p className="text-blue-700">This is your item</p>
              </div>
            )}
          </div>
        </div>

        {/* Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Request Swap</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose swap option:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="swapType"
                        value="points"
                        checked={!selectedOfferItem}
                        onChange={() => setSelectedOfferItem('')}
                        className="text-emerald-600"
                      />
                      <span>Use {selectedItem.pointValue} points</span>
                      {currentUser && currentUser.points < selectedItem.pointValue && (
                        <span className="text-red-500 text-sm">(Insufficient points)</span>
                      )}
                    </label>
                    
                    {userItems.length > 0 && (
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="swapType"
                          value="item"
                          checked={!!selectedOfferItem}
                          onChange={() => setSelectedOfferItem(userItems[0]?.id || '')}
                          className="text-emerald-600"
                        />
                        <span>Offer one of my items</span>
                      </label>
                    )}
                  </div>
                </div>

                {selectedOfferItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select item to offer:
                    </label>
                    <select
                      value={selectedOfferItem}
                      onChange={(e) => setSelectedOfferItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {userItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} ({item.pointValue} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional):
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add a personal message..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSwapModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSwap}
                    disabled={!selectedOfferItem && (!currentUser || currentUser.points < selectedItem.pointValue)}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};