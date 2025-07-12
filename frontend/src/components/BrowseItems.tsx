import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Grid3X3, List, Heart, Eye, User, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '../contexts/ItemsContext';
import type { FilterOptions } from '../types';

export const BrowseItems: React.FC = () => {
  const navigate = useNavigate();
  const { items, setSelectedItem, loading, error, fetchItems } = useItems();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    category: '',
    size: '',
    condition: '',
    minPoints: undefined,
    maxPoints: undefined,
  });

  const categories = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const conditions = ['All', 'New', 'Like New', 'Excellent', 'Good', 'Fair'];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = !filters.searchTerm || 
        item.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(filters.searchTerm?.toLowerCase() || ''));
      
      const matchesCategory = !filters.category || filters.category === 'All' || item.category === filters.category;
      const matchesSize = !filters.size || filters.size === 'All' || item.size === filters.size;
      const matchesCondition = !filters.condition || filters.condition === 'All' || item.condition === filters.condition;
      const matchesMinPoints = !filters.minPoints || item.pointValue >= filters.minPoints;
      const matchesMaxPoints = !filters.maxPoints || item.pointValue <= filters.maxPoints;

      return matchesSearch && matchesCategory && matchesSize && matchesCondition && matchesMinPoints && matchesMaxPoints;
    });
  }, [items, filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    navigate(`/item/${item.id}`);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
          <p className="text-gray-600">
            Discover amazing items from our sustainable fashion community
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error loading items: {error}</p>
            <button 
              onClick={fetchItems}
              className="mt-2 text-red-700 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Loading items...</span>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items, brands, or tags..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>

                {/* View Mode */}
                <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filters.category || ''}
                        onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category === 'All' ? '' : category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select
                        value={filters.size || ''}
                        onChange={(e) => handleFilterChange('size', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {sizes.map(size => (
                          <option key={size} value={size === 'All' ? '' : size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                      <select
                        value={filters.condition || ''}
                        onChange={(e) => handleFilterChange('condition', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {conditions.map(condition => (
                          <option key={condition} value={condition === 'All' ? '' : condition}>
                            {condition}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Points</label>
                      <input
                        type="number"
                        value={filters.minPoints || ''}
                        onChange={(e) => handleFilterChange('minPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                      <input
                        type="number"
                        value={filters.maxPoints || ''}
                        onChange={(e) => handleFilterChange('maxPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="100"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters({
                          searchTerm: '',
                          category: '',
                          size: '',
                          condition: '',
                          minPoints: undefined,
                          maxPoints: undefined,
                        })}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {filteredItems.length} of {items.length} items
              </p>
            </div>

            {/* Items Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewItem(item)}>
                    <div className="relative">
                      <img
                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-emerald-600">
                        {item.pointValue} pts
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.category} • {item.size} • {item.condition}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>{item.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewItem(item)}>
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.images && item.images.length > 0 ? item.images[0] : '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description ? item.description.substring(0, 100) + '...' : 'No description available'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{item.category} • {item.size} • {item.condition}</span>
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{item.userName}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views || 0}</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-emerald-600 mb-1">{item.pointValue} pts</div>
                        <div className="text-xs text-gray-500">
                          {item.datePosted ? new Date(item.datePosted).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};