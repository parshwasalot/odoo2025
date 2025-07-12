import React from 'react';
import { ArrowRight, Recycle, Users, Heart, Leaf, TrendingUp, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface LandingPageProps {
  setCurrentPage: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage }) => {
  const { currentUser } = useUser();

  const stats = [
    { label: 'Items Exchanged', value: '12,547', icon: Recycle },
    { label: 'Active Users', value: '8,293', icon: Users },
    { label: 'CO2 Saved (kg)', value: '45,678', icon: Leaf },
    { label: 'Community Rating', value: '4.9★', icon: Award },
  ];

  const features = [
    {
      title: 'Sustainable Exchange',
      description: 'Give your clothes a second life while discovering new treasures from our community.',
      icon: Recycle,
    },
    {
      title: 'Points System',
      description: 'Earn points for every item you list and use them to get items you love.',
      icon: Heart,
    },
    {
      title: 'Community Driven',
      description: 'Connect with like-minded individuals who share your passion for sustainable fashion.',
      icon: Users,
    },
    {
      title: 'Environmental Impact',
      description: 'Track your positive impact on the environment with every swap you make.',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Fashion
              <span className="block text-emerald-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our community of conscious fashion lovers. Swap, share, and discover amazing clothing 
              while reducing textile waste and building a more sustainable future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setCurrentPage('browse')}
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Browsing</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {currentUser ? (
                <button
                  onClick={() => setCurrentPage('add-item')}
                  className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 hover:text-white transition-all duration-200"
                >
                  List an Item
                </button>
              ) : (
                <button
                  onClick={() => setCurrentPage('browse')}
                  className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 hover:text-white transition-all duration-200"
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make sustainable fashion accessible, rewarding, and fun for everyone in our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of fashion lovers who are building a more sustainable future, one swap at a time.
          </p>
          <button
            onClick={() => setCurrentPage('browse')}
            className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
          >
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};