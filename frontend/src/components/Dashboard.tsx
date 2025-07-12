import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Eye, MessageCircle, Heart, TrendingUp, Award, Calendar, Settings, RefreshCw } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface UserItem {
  id: string;
  title: string;
  category: string;
  size: string;
  pointValue: number;
  views: number;
  images: string[];
}

interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'success' | 'info';
}

export const Dashboard: React.FC = () => {
  const { currentUser, token, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isFetchingRef = useRef(false);

  // Load data only once on component mount
  useEffect(() => {
    if (currentUser && token && !dataLoaded && !isFetchingRef.current) {
      console.log('Dashboard: Initial data load');
      fetchUserData();
    }
  }, [currentUser, token, dataLoaded]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 2): Promise<Response> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          if (attempt < maxRetries) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 2000;
            console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await sleep(waitTime);
            continue;
          }
        }
        
        return response;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Request failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await sleep(waitTime);
      }
    }
    throw new Error('Max retries exceeded');
  };

  const fetchUserData = async () => {
    if (!token || isFetchingRef.current) {
      console.log('Skipping fetch: no token or already fetching');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      console.log('Fetching user data at:', new Date().toISOString());

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch user items with retry logic
      try {
        const itemsResponse = await fetchWithRetry(`http://localhost:5000/api/users/items`, { headers });

        if (itemsResponse.status === 401) {
          console.error('Unauthorized access to items endpoint');
          return;
        }

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setUserItems(itemsData.map((item: any) => ({
            id: item._id,
            title: item.title,
            category: item.category,
            size: item.size,
            pointValue: item.pointValue,
            views: item.views || 0,
            images: item.images || ['/placeholder-image.jpg']
          })));
          console.log(`Loaded ${itemsData.length} user items`);
        } else {
          console.error('Failed to fetch items:', itemsResponse.status, itemsResponse.statusText);
          setUserItems([]);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setUserItems([]);
      }

      // Fetch user activities with retry logic
      try {
        const activitiesResponse = await fetchWithRetry(`http://localhost:5000/api/users/activities`, { headers });

        if (activitiesResponse.status === 401) {
          console.error('Unauthorized access to activities endpoint');
          return;
        }

        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
          console.log(`Loaded ${activitiesData.length} activities`);
        } else {
          console.error('Failed to fetch activities:', activitiesResponse.status, activitiesResponse.statusText);
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      }

      setDataLoaded(true);
      setLastFetchTime(new Date());
      console.log('Dashboard data fetch completed successfully');

    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserItems([]);
      setActivities([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    console.log('Manual refresh triggered');
    setDataLoaded(false); // Allow refetch
    await fetchUserData();
    await refreshUser(); // Also refresh user profile
  }, [refreshUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Please log in to view your dashboard</div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Points Balance', value: currentUser.points || 0, icon: Heart, color: 'emerald' },
    { label: 'Items Posted', value: currentUser.itemsPosted || 0, icon: Plus, color: 'blue' },
    { label: 'Swaps Completed', value: currentUser.swapsCompleted || 0, icon: TrendingUp, color: 'purple' },
    { label: 'User Rating', value: `${(currentUser.rating || 0).toFixed(1)}★`, icon: Award, color: 'yellow' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'items', label: 'My Items' },
    { id: 'activity', label: 'Activity' },
    { id: 'profile', label: 'Profile' },
  ];

  const handleViewItem = (item: UserItem): void => {
    // TODO: Navigate to item detail page or open modal
    console.log('Viewing item:', item.title);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with refresh button */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {currentUser.name}!
              </h1>
              <p className="text-gray-600">
                Manage your sustainable fashion journey and track your environmental impact.
              </p>
              {lastFetchTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {lastFetchTime.toLocaleTimeString()}
                </p>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
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

        {/* Loading state for initial load */}
        {!dataLoaded && loading && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your dashboard data...</p>
            </div>
          </div>
        )}

        {/* Tabs - only show when data is loaded or loading is complete */}
        {(dataLoaded || !loading) && (
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
                    {loading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                            <Heart className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm text-gray-700">{activity.action}: {activity.item}</span>
                            <span className="text-xs text-gray-500 ml-auto">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">No recent activity</div>
                    )}
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
                        Your swaps have contributed to our community's environmental goals.
                      </p>
                      <div className="text-xs text-green-600">
                        Green Score: {currentUser.greenScore || 0}/100
                      </div>
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
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
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
                  {loading ? (
                    <div className="text-center py-4">Loading...</div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
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
                  ) : (
                    <div className="text-center py-4 text-gray-500">No recent activity</div>
                  )}
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
                      Member since {currentUser.joinDate?.toLocaleDateString() || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};