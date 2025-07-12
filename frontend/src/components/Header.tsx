import React, { useEffect } from 'react';
import { Menu, User, MessageCircle, Heart, Search, LogOut, BarChart3 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

export interface HeaderProps {
  setIsAuthModalOpen: (isOpen: boolean) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, setIsAuthModalOpen }) => {
  const { currentUser, handleLogout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync page with URL
  useEffect(() => {
    const path = location.pathname;
    const page = path === '/' ? 'home' : path.substring(1);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [location.pathname, currentPage, setCurrentPage]);

  const navItems = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'browse', label: 'Browse', icon: Search },
  ];

  const userNavItems = currentUser ? [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'add-item', label: 'List Item', icon: Heart },
  ] : [];

  const handlePageChange = (pageId: string) => {
    const newPath = pageId === 'home' ? '/' : `/${pageId}`;
    setCurrentPage(pageId);
    navigate(newPath);
  };

  const onLogout = async () => {
    await handleLogout();
    handlePageChange('home');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handlePageChange('home')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ReWear</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {userNavItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-emerald-600'
                      : 'text-gray-700 hover:text-emerald-600'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <a 
              href="/admin" 
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              title="Admin Panel"
            >
              Admin
            </a>
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">{currentUser.points} pts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};