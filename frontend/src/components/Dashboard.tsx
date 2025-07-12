import React, { useState } from 'react';
import { Plus, Eye, MessageCircle, Heart, TrendingUp, Award, Calendar, Settings } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useItems } from '../contexts/ItemsContext';

export const Dashboard: React.FC = () => {
  const { currentUser } = useUser();
  const { items, handleViewItem } = useItems();
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser) return null;

  const userItems = items.filter(item => item.userId === currentUser.id);
  
  const stats = [
    { label: 'Points Balance', value: currentUser.points, icon: Heart, color: 'emerald' },
    { label: 'Items Posted', value: currentUser.itemsPosted, icon: Plus, color: 'blue' },
    { label: 'Swaps Completed', value: currentUser.swapsCompleted, icon: TrendingUp, color: 'purple' },
    { label: 'User Rating', value: `${currentUser.rating}★`, icon: Award, color: 'yellow' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'items', label: 'My Items' },
    { id: 'activity', label: 'Activity' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-gray-600">
            Manage your sustainable fashion journey and track your environmental impact.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                      <Heart className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-gray-700">You earned 25 points for listing a new item</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">New message from Sarah about your vintage jacket</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Your rating increased to 4.8 stars</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">🌱</span>
                      </div>
                      <span className="font-semibold text-green-800">Great work!</span>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      Your swaps have saved approximately <strong>12.5 kg of CO2</strong> and diverted <strong>8 items</strong> from landfills.
                    </p>
                    <div className="text-xs text-green-600">Keep up the sustainable fashion practices!</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Listed Items</h3>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    Add New Item
                  </button>
                </div>
                
                {userItems.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userItems.map(item => (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.category} • {item.size}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-600 font-semibold">{item.pointValue} pts</span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>{item.views}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewItem(item)}
                            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No items listed yet</h4>
                    <p className="text-gray-600 mb-4">Start your sustainable fashion journey by listing your first item!</p>
                    <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                      List Your First Item
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Listed new item', item: 'Vintage Denim Jacket', time: '2 hours ago', type: 'success' },
                    { action: 'Received swap request', item: 'Summer Dress', time: '1 day ago', type: 'info' },
                    { action: 'Completed swap', item: 'Cotton T-Shirt', time: '3 days ago', type: 'success' },
                    { action: 'Earned rating', item: '5 stars from Emma', time: '1 week ago', type: 'success' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}: <strong>{activity.item}</strong></p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={currentUser.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={currentUser.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={currentUser.bio}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Tell the community about yourself and your sustainable fashion journey..."
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Member since {currentUser.joinDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};