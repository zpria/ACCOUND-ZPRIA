
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, Plus, Minus, ChevronLeft, Package,
  AlertCircle, CheckCircle2, Loader2, ArrowRight, Tag,
  Truck, Shield, Gift, X, Heart
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, dbConfig } from '../config';

interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  sale_price?: number;
  variant_id?: string;
  variant_name?: string;
  sku?: string;
  max_quantity: number;
  is_available: boolean;
  stock_quantity: number;
  added_at: string;
}

interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  item_count: number;
  total_items: number;
}

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    item_count: 0,
    total_items: 0
  });
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from(dbConfig.tables.user_carts)
        .select(`
          *,
          product:products(id, name, image_url, is_available, stock_quantity),
          variant:product_variants(id, name, sku, price, sale_price, stock_quantity)
        `)
        .eq('user_id', userData.id)
        .order('added_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const items: CartItem[] = data.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product?.name || item.product_name,
          product_image: item.product?.image_url || item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sale_price: item.sale_price || item.variant?.sale_price,
          variant_id: item.variant_id,
          variant_name: item.variant?.name || item.variant_name,
          sku: item.variant?.sku || item.sku,
          max_quantity: item.max_quantity || 10,
          is_available: item.product?.is_available !== false,
          stock_quantity: item.variant?.stock_quantity || item.product?.stock_quantity || 0,
          added_at: item.added_at
        }));

        setCartItems(items);
        calculateSummary(items);
        // Select all by default
        setSelectedItems(new Set(items.map(item => item.id)));
      }
    } catch (err: any) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const price = item.sale_price || item.unit_price;
      return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.length;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Simple calculation - can be enhanced
    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over 1000
    const discount = 0; // Apply promo logic here
    const total = subtotal + tax + shipping - discount;

    setSummary({
      subtotal,
      discount,
      tax,
      shipping,
      total,
      item_count: itemCount,
      total_items: totalItems
    });
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(i => i.id === itemId);
    if (!item || newQuantity > item.max_quantity) {
      setError(`Maximum quantity allowed: ${item?.max_quantity || 10}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_carts')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateSummary(updatedItems);
    } catch (err: any) {
      setError(err.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);
      calculateSummary(updatedItems);
      
      // Remove from selected
      const newSelected = new Set(selectedItems);
      newSelected.delete(itemId);
      setSelectedItems(newSelected);

      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;

    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userData.id);

      if (error) throw error;

      setCartItems([]);
      calculateSummary([]);
      setSelectedItems(new Set());
      setSuccess('Cart cleared');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to clear cart');
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setIsApplyingPromo(true);
    
    // Mock promo code logic - implement actual validation
    setTimeout(() => {
      setError('Invalid promo code');
      setIsApplyingPromo(false);
    }, 1000);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
  const selectedSummary = selectedCartItems.reduce((acc, item) => {
    const price = item.sale_price || item.unit_price;
    return {
      subtotal: acc.subtotal + (price * item.quantity),
      count: acc.count + item.quantity
    };
  }, { subtotal: 0, count: 0 });

  if (isLoading) {
    return <LoadingOverlay message="Loading cart..." />;
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
                <h1 className="text-[28px] font-semibold text-[#1d1d1f]">Shopping Cart</h1>
                <p className="text-[#86868b] text-sm">{cartItems.length} items in your cart</p>
              </div>
            </div>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
              >
                Clear Cart
              </button>
            )}
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

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Your Cart is Empty</h2>
            <p className="text-[#86868b] mb-6">Looks like you haven't added anything to your cart yet</p>
            <button
              onClick={() => navigate('/product-hub')}
              className="px-8 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors inline-flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                    selectedItems.has(item.id) ? 'border-[#6366f1]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 text-[#6366f1] rounded focus:ring-[#6366f1]"
                      />
                    </label>

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-gray-400" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#1d1d1f]">{item.product_name}</h3>
                          {item.variant_name && (
                            <p className="text-sm text-[#86868b]">Variant: {item.variant_name}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-[#86868b]">SKU: {item.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1d1d1f]">
                            ৳{((item.sale_price || item.unit_price) * item.quantity).toFixed(2)}
                          </p>
                          {item.sale_price && item.sale_price < item.unit_price && (
                            <p className="text-sm text-[#86868b] line-through">
                              ৳{(item.unit_price * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {!item.is_available && (
                        <div className="mb-3 p-2 bg-red-50 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Currently unavailable</span>
                        </div>
                      )}

                      {item.stock_quantity < item.quantity && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded-lg flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">
                            Only {item.stock_quantity} left in stock
                          </span>
                        </div>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.max_quantity || item.quantity >= item.stock_quantity}
                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/wishlist`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Move to wishlist"
                          >
                            <Heart className="w-5 h-5 text-gray-400" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
                <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                    />
                    <button
                      onClick={applyPromoCode}
                      disabled={isApplyingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isApplyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#86868b]">
                    <span>Subtotal ({selectedSummary.count} items)</span>
                    <span>৳{selectedSummary.subtotal.toFixed(2)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        Discount
                      </span>
                      <span>-৳{summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#86868b]">
                    <span>Tax (5%)</span>
                    <span>৳{(selectedSummary.subtotal * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#86868b]">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span>{selectedSummary.subtotal > 1000 ? 'Free' : '৳100.00'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-[#1d1d1f]">
                      <span>Total</span>
                      <span>
                        ৳{(selectedSummary.subtotal + (selectedSummary.subtotal * 0.05) + (selectedSummary.subtotal > 1000 ? 0 : 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={selectedItems.size === 0}
                  className="w-full py-4 bg-[#6366f1] text-white rounded-xl font-semibold hover:bg-[#5558e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[#86868b]">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#86868b]">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Free shipping over ৳1000</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#86868b]">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span>Earn loyalty points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
