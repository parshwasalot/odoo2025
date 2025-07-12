import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Eye, Calendar, Package, Repeat, Search } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItems } from '../contexts/ItemsContext';
import { useUser } from '../contexts/UserContext';
import { swapService } from '../services/swapService';

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedItem, items, setSelectedItem } = useItems();
  const { currentUser } = useUser();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedOfferItem, setSelectedOfferItem] = useState<string>('');
  const [message, setMessage] = useState('');
  const [showBrowse, setShowBrowse] = useState(!id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [swapping, setSwapping] = useState(false);

  const userItems = currentUser ? items.filter(item => item.userId === currentUser.id && item.id !== selectedItem?.id && item.isAvailable) : [];

  const getItemById = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  const selectItemById = (itemId: string) => {
    const item = getItemById(itemId);
    if (item) {
      setSelectedItem(item);
      navigate(`/item/${itemId}`);
      setShowBrowse(false);
    }
  };

  const goToBrowse = () => {
    setShowBrowse(true);
    setSelectedItem(null);
    navigate('/browse');
  };

  useEffect(() => {
    if (id) {
      const item = getItemById(id);
      if (item) {
        setSelectedItem(item);
        setShowBrowse(false);
      } else {
        // Item not found, redirect to browse
        goToBrowse();
      }
    } else {
      // No ID in URL, show browse
      setShowBrowse(true);
      setSelectedItem(null);
    }
  }, [id, items]);

  // Reset selected image when item changes and set default offer item
  useEffect(() => {
    setSelectedImage(0);
    if (userItems.length > 0) {
      setSelectedOfferItem(userItems[0].id?.toString() || '');
    }
  }, [selectedItem, userItems]);

  // Filter items for browse view
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map(item => item.category))];

  // If showing browse view or no item selected
  if (showBrowse || !selectedItem || !id) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Items</h1>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => selectItemById(item.id?.toString() || '')}
                >
                  <div className="aspect-square overflow-hidden rounded-t-xl">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg'}
                      alt={item.title || 'Item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title || 'Untitled Item'}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.category || 'Unknown Category'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-bold">{item.pointValue || 0} pts</span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.views || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{item.userRating || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No items found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleSwap = async () => {
    if (!currentUser || !selectedItem) return;
    
    setSwapping(true);
    try {
      const swapData: any = {
        itemId: selectedItem.id,
        message: message || undefined
      };
      
      if (selectedOfferItem) {
        swapData.offeredItemId = selectedOfferItem;
      }
      
      await swapService.createSwapRequest(swapData);
      setShowSwapModal(false);
      setMessage('');
      setSelectedOfferItem('');
      alert('Swap request sent successfully!');
    } catch (error: any) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={goToBrowse}
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
                src={selectedItem.images && selectedItem.images.length > 0 ? selectedItem.images[selectedImage] : '/placeholder-image.jpg'}
                alt={selectedItem.title || 'Item'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
            {selectedItem.images && selectedItem.images.length > 1 && (
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
                      alt={`${selectedItem.title || 'Item'} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedItem.title || 'Untitled Item'}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <span className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{selectedItem.category || 'Unknown'}</span>
                </span>
                <span>Size {selectedItem.size || 'Unknown'}</span>
                <span>{selectedItem.condition || 'Unknown'}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{selectedItem.description || 'No description available'}</p>
            </div>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
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
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{selectedItem.pointValue || 0}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedItem.views || 0}</div>
                <div className="text-xs text-gray-600">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedItem.userRating || 0}</div>
                <div className="text-xs text-gray-600">Seller Rating</div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {selectedItem.userName ? selectedItem.userName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedItem.userName || 'Unknown User'}</div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedItem.userRating || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {selectedItem.datePosted ? selectedItem.datePosted.toLocaleDateString() : 'Unknown date'}</span>
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
              </div>
            ) : !currentUser ? (
              <div className="bg-gray-100 p-4 rounded-xl text-center">
                <p className="text-gray-600 mb-3">Sign in to request a swap</p>
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
                    {userItems.length > 0 ? (
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="swapType"
                          value="item"
                          checked={true}
                          onChange={() => setSelectedOfferItem(userItems[0]?.id?.toString() || '')}
                          className="text-emerald-600"
                        />
                        <span>Offer one of my items</span>
                      </label>
                    ) : (
                      <p className="text-gray-600">You need to have posted items to make swap offers.</p>
                    )}
                  </div>
                </div>

                {userItems.length > 0 && (
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
                    disabled={swapping || userItems.length === 0}
                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {swapping ? 'Sending...' : 'Send Request'}
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