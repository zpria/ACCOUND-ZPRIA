
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Trash2, ChevronLeft, Package,
  AlertCircle, CheckCircle2, Loader2, ArrowRight,
  Share2, FolderPlus, X, Plus, Grid3X3, List
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors } from '../config';

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  unit_price: number;
  sale_price?: number;
  currency: string;
  availability_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'coming_soon';
  stock_quantity: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  added_at: string;
  notify_on_sale: boolean;
  notify_on_stock: boolean;
}

interface WishlistList {
  id: string;
  list_name: string;
  description?: string;
  is_default: boolean;
  is_public: boolean;
  item_count: number;
  created_at: string;
}

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLists, setWishlistLists] = useState<WishlistList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadWishlistData();
  }, []);

  const loadWishlistData = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Load wishlist lists
      const { data: listsData, error: listsError } = await supabase
        .from('user_wishlist_lists')
        .select('*')
        .eq('user_id', userData.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;
      setWishlistLists(listsData || []);

      // Set default list as active
      const defaultList = listsData?.find((l: any) => l.is_default);
      if (defaultList) {
        setActiveListId(defaultList.id);
      }

      // Load wishlist items
      const { data: itemsData, error: itemsError } = await supabase
        .from('user_wishlists')
        .select(`
          *,
          product:products(id, name, image_url, is_available, stock_quantity)
        `)
        .eq('user_id', userData.id)
        .order('added_at', { ascending: false });

      if (itemsError) throw itemsError;

      if (itemsData) {
        const items: WishlistItem[] = itemsData.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product?.name || item.product_name,
          product_image: item.product?.image_url || item.product_image,
          unit_price: item.unit_price,
          sale_price: item.sale_price,
          currency: item.currency || 'BDT',
          availability_status: item.availability_status || 'in_stock',
          stock_quantity: item.product?.stock_quantity || item.stock_quantity || 0,
          priority: item.priority || 'medium',
          notes: item.notes,
          added_at: item.added_at,
          notify_on_sale: item.notify_on_sale || false,
          notify_on_stock: item.notify_on_stock || false
        }));
        setWishlistItems(items);
      }
    } catch (err: any) {
      console.error('Failed to load wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      const { data, error } = await supabase
        .from('user_wishlist_lists')
        .insert({
          user_id: userData.id,
          list_name: newListName.trim(),
          description: newListDescription.trim() || null,
          is_default: false,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      setWishlistLists([...wishlistLists, data]);
      setActiveListId(data.id);
      setShowCreateListModal(false);
      setNewListName('');
      setNewListDescription('');
      setSuccess('List created successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create list');
    } finally {
      setIsCreating(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('user_wishlists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      setSuccess('Item removed from wishlist');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const addToCart = async (item: WishlistItem) => {
    setAddingToCart(item.id);
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }
      const userData = JSON.parse(savedUser);

      const { error } = await supabase
        .from('user_carts')
        .insert({
          user_id: userData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: 1,
          unit_price: item.sale_price || item.unit_price,
          sale_price: item.sale_price,
          currency: item.currency
        });

      if (error) throw error;

      setSuccess('Added to cart');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const updatePriority = async (itemId: string, priority: 'low' | 'medium' | 'high') => {
    try {
      const { error } = await supabase
        .from('user_wishlists')
        .update({ priority })
        .eq('id', itemId);

      if (error) throw error;

      setWishlistItems(wishlistItems.map(item =>
        item.id === itemId ? { ...item, priority } : item
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update priority');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">In Stock</span>;
      case 'low_stock':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Low Stock</span>;
      case 'out_of_stock':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Out of Stock</span>;
      case 'coming_soon':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Coming Soon</span>;
      default:
        return null;
    }
  };

  const filteredItems = activeListId
    ? wishlistItems // In real implementation, filter by list_id
    : wishlistItems;

  if (isLoading) {
    return <LoadingOverlay message="Loading wishlist..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/product-hub')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-[28px] font-semibold text-[#1d1d1f]">My Wishlist</h1>
                <p className="text-[#86868b] text-sm">{wishlistItems.length} saved items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid3X3 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => setShowCreateListModal(true)}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors flex items-center gap-2"
              >
                <FolderPlus className="w-5 h-5" />
                New List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Lists Tabs */}
        {wishlistLists.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveListId(null)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                activeListId === null
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Items
            </button>
            {wishlistLists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  activeListId === list.id
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {list.list_name}
                {list.is_default && <span className="ml-2 text-xs opacity-75">(Default)</span>}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Your Wishlist is Empty</h2>
            <p className="text-[#86868b] mb-6">Save items you love to your wishlist</p>
            <button
              onClick={() => navigate('/product-hub')}
              className="px-8 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors inline-flex items-center gap-2"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Wishlist Items */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative bg-gray-100 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {getAvailabilityBadge(item.availability_status)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#1d1d1f] mb-2 line-clamp-2">{item.product_name}</h3>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-[#1d1d1f]">
                      {item.currency} {item.sale_price || item.unit_price}
                    </span>
                    {item.sale_price && item.sale_price < item.unit_price && (
                      <span className="text-sm text-[#86868b] line-through">
                        {item.currency} {item.unit_price}
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-[#86868b] mb-3 line-clamp-2">{item.notes}</p>
                  )}

                  <p className="text-xs text-[#86868b] mb-4">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={addingToCart === item.id || item.availability_status === 'out_of_stock'}
                      className="flex-1 py-2 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingToCart === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/product/${item.product_id}`)}
                      className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Priority Selector */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="text-xs text-[#86868b] mb-2 block">Priority</label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => updatePriority(item.id, p)}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                            item.priority === p
                              ? getPriorityColor(p)
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {showCreateListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Create New List</h2>
              <button
                onClick={() => {
                  setShowCreateListModal(false);
                  setNewListName('');
                  setNewListDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={createList}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">List Name *</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Birthday Gifts, Shopping List"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Description (Optional)</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateListModal(false);
                    setNewListName('');
                    setNewListDescription('');
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newListName.trim()}
                  className="flex-1 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create List
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
