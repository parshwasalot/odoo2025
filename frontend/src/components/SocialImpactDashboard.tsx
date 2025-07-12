import React, { useState } from 'react';
import { 
  Leaf, 
  Droplets, 
  Recycle, 
  Award, 
  TrendingUp, 
  Globe, 
  Users, 
  Target,
  Calendar,
  MapPin,
  Trophy,
  Star,
  ArrowUp,
  Heart
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import type { EnvironmentalImpact, GreenScore, CityMetrics } from '../types';

export const SocialImpactDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'personal' | 'community' | 'global'>('personal');

  if (!currentUser) return null;

  // Mock data - in a real app, this would come from your backend
  const personalImpact: EnvironmentalImpact = {
    co2Saved: 12.5,
    waterConserved: 2840,
    wasteReduced: 3.2,
    itemsRescued: 8
  };

  const greenScore: GreenScore = {
    score: 78,
    level: 'Eco-Warrior',
    nextLevelPoints: 22,
    achievements: [
      'First Swap Completed',
      'Water Saver (1000L+)',
      'CO2 Reducer (10kg+)',
      'Community Builder',
      'Sustainable Streak (7 days)'
    ]
  };

  const cityMetrics: CityMetrics = {
    cityName: 'San Francisco',
    totalUsers: 2847,
    totalSwaps: 12547,
    environmentalImpact: {
      co2Saved: 15420,
      waterConserved: 3250000,
      wasteReduced: 8750,
      itemsRescued: 12547
    },
    ranking: 3,
    topCities: [
      { name: 'Portland', impact: { co2Saved: 18200, waterConserved: 4100000, wasteReduced: 10200, itemsRescued: 15800 }, ranking: 1 },
      { name: 'Seattle', impact: { co2Saved: 16800, waterConserved: 3800000, wasteReduced: 9400, itemsRescued: 14200 }, ranking: 2 },
      { name: 'San Francisco', impact: { co2Saved: 15420, waterConserved: 3250000, wasteReduced: 8750, itemsRescued: 12547 }, ranking: 3 },
      { name: 'Austin', impact: { co2Saved: 14100, waterConserved: 2900000, wasteReduced: 7800, itemsRescued: 11200 }, ranking: 4 },
      { name: 'Denver', impact: { co2Saved: 12900, waterConserved: 2650000, wasteReduced: 7200, itemsRescued: 10400 }, ranking: 5 }
    ]
  };

  const globalImpact: EnvironmentalImpact = {
    co2Saved: 125000,
    waterConserved: 28500000,
    wasteReduced: 67000,
    itemsRescued: 89000
  };

  const tabs = [
    { id: 'personal', label: 'My Impact', icon: Users },
    { id: 'community', label: 'City Impact', icon: MapPin },
    { id: 'global', label: 'Global Impact', icon: Globe }
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Planet Hero': return Trophy;
      case 'Sustainability Champion': return Award;
      case 'Eco-Warrior': return Star;
      default: return Leaf;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Impact Dashboard</h1>
          <p className="text-gray-600">
            Track your environmental impact and see how our community is changing the world
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-8">
                {/* Green Score */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Your Green Score</h3>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getLevelIcon(greenScore.level), { 
                        className: `w-6 h-6 text-${getScoreColor(greenScore.score)}-600` 
                      })}
                      <span className={`text-${getScoreColor(greenScore.score)}-600 font-semibold`}>
                        {greenScore.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Score: {greenScore.score}/100</span>
                        <span>{greenScore.nextLevelPoints} points to next level</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`bg-${getScoreColor(greenScore.score)}-500 h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${greenScore.score}%` }}
                        />
                      </div>
                    </div>
                    <div className={`text-3xl font-bold text-${getScoreColor(greenScore.score)}-600`}>
                      {greenScore.score}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {greenScore.achievements.map((achievement, index) => (
                      <div key={index} className="bg-white bg-opacity-60 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">{achievement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Impact Metrics */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Environmental Impact</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-green-600" />
                        </div>
                        <ArrowUp className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{personalImpact.co2Saved} kg</div>
                      <div className="text-sm text-gray-600">CO₂ Saved</div>
                      <div className="text-xs text-green-600 mt-2">
                        Equivalent to planting {Math.round(personalImpact.co2Saved * 0.5)} trees
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <ArrowUp className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{formatNumber(personalImpact.waterConserved)}L</div>
                      <div className="text-sm text-gray-600">Water Conserved</div>
                      <div className="text-xs text-blue-600 mt-2">
                        {Math.round(personalImpact.waterConserved / 150)} days of drinking water
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Recycle className="w-6 h-6 text-purple-600" />
                        </div>
                        <ArrowUp className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{personalImpact.wasteReduced} kg</div>
                      <div className="text-sm text-gray-600">Waste Reduced</div>
                      <div className="text-xs text-purple-600 mt-2">
                        Diverted from landfills
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-6 h-6 text-emerald-600" />
                        </div>
                        <ArrowUp className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{personalImpact.itemsRescued}</div>
                      <div className="text-sm text-gray-600">Items Rescued</div>
                      <div className="text-xs text-emerald-600 mt-2">
                        Given second life
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Progress */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Progress</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Swaps Completed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }} />
                        </div>
                        <span className="text-sm font-medium">3/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Items Listed</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }} />
                        </div>
                        <span className="text-sm font-medium">4/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Community Engagement</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                        <span className="text-sm font-medium">9/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-8">
                {/* City Overview */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {cityMetrics.cityName} Impact
                    </h3>
                    <div className="flex items-center space-x-2 bg-white bg-opacity-60 px-3 py-1 rounded-full">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Ranked #{cityMetrics.ranking} nationally
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(cityMetrics.totalUsers)}</div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(cityMetrics.totalSwaps)}</div>
                      <div className="text-sm text-gray-600">Total Swaps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{cityMetrics.environmentalImpact.co2Saved} kg</div>
                      <div className="text-sm text-gray-600">CO₂ Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{formatNumber(cityMetrics.environmentalImpact.waterConserved)}L</div>
                      <div className="text-sm text-gray-600">Water Saved</div>
                    </div>
                  </div>
                </div>

                {/* City Rankings */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Sustainable Cities</h3>
                  <div className="space-y-4">
                    {cityMetrics.topCities.map((city, index) => (
                      <div 
                        key={city.name} 
                        className={`p-4 rounded-xl border-2 transition-all ${
                          city.name === cityMetrics.cityName 
                            ? 'border-emerald-200 bg-emerald-50' 
                            : 'border-gray-100 bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {city.ranking}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{city.name}</div>
                              <div className="text-sm text-gray-600">
                                {formatNumber(city.impact.itemsRescued)} items rescued
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              {city.impact.co2Saved} kg CO₂
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatNumber(city.impact.waterConserved)}L water
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Challenges */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Challenges</h3>
                  <div className="space-y-4">
                    <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-emerald-800">Earth Month Challenge</span>
                        <span className="text-sm text-emerald-600">15 days left</span>
                      </div>
                      <div className="text-sm text-emerald-700 mb-3">
                        Help {cityMetrics.cityName} save 20,000 kg of CO₂ this month!
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-3 mb-2">
                        <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <div className="text-xs text-emerald-600">15,000 / 20,000 kg CO₂ saved</div>
                    </div>
                    
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-800">Water Conservation Week</span>
                        <span className="text-sm text-blue-600">3 days left</span>
                      </div>
                      <div className="text-sm text-blue-700 mb-3">
                        Conserve 500,000L of water through sustainable swaps
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                        <div className="bg-blue-500 h-3 rounded-full" style={{ width: '60%' }} />
                      </div>
                      <div className="text-xs text-blue-600">300,000 / 500,000L conserved</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'global' && (
              <div className="space-y-8">
                {/* Global Impact Overview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Global ReWear Impact</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Leaf className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(globalImpact.co2Saved)} kg</div>
                      <div className="text-sm text-gray-600">Total CO₂ Saved</div>
                      <div className="text-xs text-green-600 mt-1">
                        = {formatNumber(globalImpact.co2Saved * 0.5)} trees planted
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Droplets className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(globalImpact.waterConserved)}L</div>
                      <div className="text-sm text-gray-600">Water Conserved</div>
                      <div className="text-xs text-blue-600 mt-1">
                        = {formatNumber(globalImpact.waterConserved / 150)} days of drinking water
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Recycle className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(globalImpact.wasteReduced)} kg</div>
                      <div className="text-sm text-gray-600">Waste Diverted</div>
                      <div className="text-xs text-purple-600 mt-1">
                        From landfills
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(globalImpact.itemsRescued)}</div>
                      <div className="text-sm text-gray-600">Items Rescued</div>
                      <div className="text-xs text-emerald-600 mt-1">
                        Given new life
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Statistics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold text-gray-900">47,293</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cities Covered</span>
                        <span className="font-semibold text-gray-900">156</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Countries</span>
                        <span className="font-semibold text-gray-900">23</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Monthly Growth</span>
                        <span className="font-semibold text-emerald-600">+12.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Milestones</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-700">100,000 kg CO₂ saved milestone reached!</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-700">25M liters of water conserved</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-700">50,000 kg waste diverted from landfills</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-sm text-gray-700">75,000+ items given second life</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Global Initiatives */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Sustainability Initiatives</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Globe className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-green-800">Climate Action Partnership</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Working with environmental organizations to amplify our impact and support global climate goals.
                      </p>
                    </div>
                    
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center space-x-3 mb-3">
                        <Users className="w-6 h-6 text-blue-600" />
                        <span className="font-medium text-blue-800">Community Education</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Educational programs and workshops to promote sustainable fashion practices worldwide.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};