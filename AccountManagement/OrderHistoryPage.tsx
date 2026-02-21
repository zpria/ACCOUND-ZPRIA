
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Package, Truck, CheckCircle, Clock, X, Search, Filter, Download, Eye, MapPin, CreditCard, DollarSign, RotateCcw, Gift, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, DB_CONFIG } from '../config';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned' | 'on_hold';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  sale_price?: number;
  total_price: number;
  variant_name?: string;
  is_digital: boolean;
  download_url?: string;
  download_count?: number;
  max_downloads?: number;
}

interface Order {
  // Core order info
  id: string;
  order_number: string;
  status: OrderStatus;
  items: OrderItem[];
  item_count: number;
  
  // Pricing
  subtotal: number;
  tax: number;
  tax_rate: number;
  shipping: number;
  shipping_cost: number;
  discount: number;
  coupon_code?: string;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  total: number;
  currency: string;
  
  // Payment
  payment_method: string;
  payment_status: PaymentStatus;
  payment_id?: string;
  invoice_url?: string;
  receipt_url?: string;
  
  // Shipping
  shipping_address: string;
  shipping_method: ShippingMethod;
  estimated_delivery?: string;
  delivered_at?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipping_carrier?: string;
  
  // Metadata
  notes?: string;
  gift_message?: string;
  is_gift: boolean;
  gift_wrap: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  
  // User info at time of order
  customer_email: string;
  customer_phone?: string;
  billing_address: string;
}

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Fetch from user_purchases table (using the UserPurchase interface from types.ts)
      const { data, error } = await supabase
        .from(DB_CONFIG.tables.user_purchases)
        .select('*')
        .eq('userId', userData.id)
        .order('purchasedAt', { ascending: false });

      if (error) throw error;

      if (data) {
        // Group purchases by order ID to create orders with multiple items
        const ordersMap: Record<string, Order> = {};
        
        data.forEach((purchase: any) => {
          // Use orderId as the key to group items
          const orderId = purchase.orderId;
          
          if (!ordersMap[orderId]) {
            // Create a new order entry
            ordersMap[orderId] = {
              // Core
              id: orderId,
              order_number: orderId || `ZPR-${orderId.slice(0, 8).toUpperCase()}`,
              status: purchase.status || 'pending',
              items: [],
              item_count: 0,
              
              // Pricing
              subtotal: purchase.totalPrice || 0,
              tax: 0, // Not available in UserPurchase
              tax_rate: 0, // Not available in UserPurchase
              shipping: 0, // Not available in UserPurchase
              shipping_cost: 0, // Not available in UserPurchase
              discount: purchase.discountAmount || 0,
              coupon_code: purchase.couponCode,
              loyalty_points_used: 0, // Not available in UserPurchase
              loyalty_points_earned: 0, // Not available in UserPurchase
              total: purchase.totalPrice || 0,
              currency: purchase.currency || 'BDT',
              
              // Payment
              payment_method: purchase.paymentMethod || 'Unknown',
              payment_status: purchase.status === 'completed' ? 'paid' : purchase.status as PaymentStatus || 'pending',
              payment_id: '', // Not available in UserPurchase
              invoice_url: '', // Not available in UserPurchase
              receipt_url: '', // Not available in UserPurchase
              
              // Shipping
              shipping_address: 'Address not available', // Not available in UserPurchase
              shipping_method: 'standard', // Default
              estimated_delivery: '', // Not available in UserPurchase
              delivered_at: '', // Not available in UserPurchase
              tracking_number: '', // Not available in UserPurchase
              tracking_url: '', // Not available in UserPurchase
              shipping_carrier: '', // Not available in UserPurchase
              
              // Metadata
              notes: '', // Not available in UserPurchase
              gift_message: '', // Not available in UserPurchase
              is_gift: purchase.isGift || false,
              gift_wrap: false, // Not available in UserPurchase
              
              // Timestamps
              created_at: purchase.purchasedAt,
              updated_at: purchase.purchasedAt, // Use purchasedAt as updated_at
              paid_at: purchase.status === 'completed' ? purchase.purchasedAt : undefined,
              shipped_at: undefined, // Not available in UserPurchase
              cancelled_at: purchase.status === 'cancelled' ? purchase.purchasedAt : undefined,
              cancel_reason: purchase.status === 'cancelled' ? 'Order was cancelled' : undefined,
              
              // User info
              customer_email: userData.email || '',
              customer_phone: userData.mobile || '',
              billing_address: 'Address not available' // Not available in UserPurchase
            };
          }
          
          // Add the item to the order
          ordersMap[orderId].items.push({
            id: purchase.id,
            product_id: purchase.productId,
            product_name: purchase.productName || 'Unknown Product',
            product_image: '', // Not available in UserPurchase
            product_sku: '', // Not available in UserPurchase
            quantity: purchase.quantity || 1,
            unit_price: purchase.unitPrice || 0,
            sale_price: purchase.unitPrice, // Use unitPrice as sale_price
            total_price: purchase.totalPrice || 0,
            variant_name: '', // Not available in UserPurchase
            is_digital: purchase.isDigital || false,
            download_url: purchase.downloadLink || '',
            download_count: 0, // Not available in UserPurchase
            max_downloads: 0 // Not available in UserPurchase
          });
          
          // Update item count
          ordersMap[orderId].item_count = ordersMap[orderId].items.length;
        });
        
        // Convert map to array
        const formattedOrders: Order[] = Object.values(ordersMap);
        setOrders(formattedOrders);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(query) ||
        order.items.some(item => item.product_name.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'on_hold':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <X className="w-5 h-5" />;
      case 'refunded':
        return <DollarSign className="w-5 h-5" />;
      case 'returned':
        return <RotateCcw className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'on_hold':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-purple-100 text-purple-700';
      case 'returned':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      case 'refunded':
      case 'partially_refunded':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDownloadInvoice = (order: Order) => {
    // Generate comprehensive invoice with all SQL fields
    const invoiceText = `
═══════════════════════════════════════════════════════════════
                        ZPRIA ORDER INVOICE
═══════════════════════════════════════════════════════════════

ORDER INFORMATION
─────────────────
Order Number:     ${order.order_number}
Order Date:       ${formatDate(order.created_at)}
Order Status:     ${order.status.toUpperCase()}
Payment Status:   ${order.payment_status.toUpperCase()}
Currency:         ${order.currency}

CUSTOMER INFORMATION
────────────────────
Email:            ${order.customer_email}
${order.customer_phone ? `Phone:            ${order.customer_phone}` : ''}

BILLING ADDRESS
───────────────
${order.billing_address}

SHIPPING INFORMATION
────────────────────
Address:          ${order.shipping_address}
Method:           ${order.shipping_method}
${order.estimated_delivery ? `Est. Delivery:    ${formatDate(order.estimated_delivery)}` : ''}
${order.shipped_at ? `Shipped Date:     ${formatDate(order.shipped_at)}` : ''}
${order.delivered_at ? `Delivered Date:   ${formatDate(order.delivered_at)}` : ''}
${order.tracking_number ? `Tracking #:       ${order.tracking_number}` : ''}
${order.shipping_carrier ? `Carrier:          ${order.shipping_carrier}` : ''}

ORDER ITEMS
───────────
${order.items.map((item, i) => `
${i + 1}. ${item.product_name}
   ${item.variant_name ? `   Variant: ${item.variant_name}` : ''}
   ${item.product_sku ? `   SKU: ${item.product_sku}` : ''}
   Quantity: ${item.quantity} x ${formatCurrency(item.sale_price || item.unit_price)}
   Subtotal: ${formatCurrency(item.total_price)}
`).join('')}

PAYMENT DETAILS
───────────────
Payment Method:   ${order.payment_method}
${order.payment_id ? `Payment ID:       ${order.payment_id}` : ''}
Subtotal:         ${formatCurrency(order.subtotal)}
Tax (${order.tax_rate}%):      ${formatCurrency(order.tax)}
Shipping:         ${formatCurrency(order.shipping)}
${order.discount > 0 ? `Discount:         -${formatCurrency(order.discount)}` : ''}
${order.coupon_code ? `Coupon (${order.coupon_code}): Applied` : ''}
${order.loyalty_points_used > 0 ? `Points Used:      -${order.loyalty_points_used} pts` : ''}
────────────────────────────────────
TOTAL:            ${formatCurrency(order.total)}
${order.loyalty_points_earned > 0 ? `Points Earned:    +${order.loyalty_points_earned} pts` : ''}

${order.is_gift ? `
GIFT INFORMATION
────────────────
This order is a gift.
${order.gift_wrap ? 'Gift wrap included.' : ''}
${order.gift_message ? `Gift Message: "${order.gift_message}"` : ''}
` : ''}

${order.notes ? `
ORDER NOTES
───────────
${order.notes}
` : ''}

${order.cancel_reason ? `
CANCELLATION
────────────
Cancelled on: ${order.cancelled_at ? formatDate(order.cancelled_at) : 'N/A'}
Reason: ${order.cancel_reason}
` : ''}

═══════════════════════════════════════════════════════════════
Thank you for shopping with ZPRIA!
For support, contact: help.zpria@gmail.com
═══════════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.order_number}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'returned', label: 'Returned' }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={() => navigate('/account-services')}
            className="flex items-center gap-2 text-[#0071e3] font-medium mb-4 hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Account Services
          </button>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Order History</h1>
                <p className="text-[#86868b]">View and track your purchases</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
            { label: 'In Progress', value: orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length },
            { label: 'Total Spent', value: formatCurrency(orders.reduce((sum, o) => sum + o.total, 0)) }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-[#86868b]">{stat.label}</p>
              <p className="text-2xl font-semibold text-[#1d1d1f]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="pl-12 pr-8 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white appearance-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Your Orders</h2>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1d1d1f]">{order.order_number}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-[#86868b]">{formatDate(order.created_at)}</p>
                      <p className="text-sm text-[#86868b]">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0051a3] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Invoice
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 min-w-fit">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1d1d1f] truncate max-w-[150px]">{item.product_name}</p>
                          <p className="text-xs text-[#86868b]">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                        <span className="text-sm text-[#86868b]">+{order.items.length - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-[#86868b]">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No orders found</p>
                <p className="text-sm mt-1">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Your order history will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f]">Order Details</h3>
                  <p className="text-[#86868b]">{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div className={`p-4 rounded-2xl ${getStatusColor(selectedOrder.status)} mb-6`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedOrder.status)}
                  <div>
                    <p className="font-semibold">Order {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</p>
                    <p className="text-sm opacity-75">
                      {selectedOrder.status === 'delivered' && selectedOrder.delivered_at 
                        ? `Delivered on ${formatDate(selectedOrder.delivered_at)}`
                        : `Ordered on ${formatDate(selectedOrder.created_at)}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-[#1d1d1f]">Items</h4>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1d1d1f]">{item.product_name}</p>
                      <p className="text-sm text-[#86868b]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-[#1d1d1f]">{formatCurrency(item.total_price)}</p>
                  </div>
                ))}
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Shipping Address */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#86868b]" />
                    <p className="font-medium text-[#1d1d1f]">Shipping Address</p>
                  </div>
                  <p className="text-sm text-[#86868b]">{selectedOrder.shipping_address}</p>
                  <p className="text-xs text-[#86868b] mt-1 capitalize">Method: {selectedOrder.shipping_method}</p>
                </div>
                
                {/* Billing Address */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#86868b]" />
                    <p className="font-medium text-[#1d1d1f]">Billing Address</p>
                  </div>
                  <p className="text-sm text-[#86868b]">{selectedOrder.billing_address}</p>
                </div>
                
                {/* Payment Info */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-[#86868b]" />
                    <p className="font-medium text-[#1d1d1f]">Payment</p>
                  </div>
                  <p className="text-sm text-[#86868b]">{selectedOrder.payment_method}</p>
                  <p className={`text-xs mt-1 capitalize font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    Status: {selectedOrder.payment_status}
                  </p>
                  {selectedOrder.payment_id && (
                    <p className="text-xs text-[#86868b] mt-1">ID: {selectedOrder.payment_id}</p>
                  )}
                </div>
                
                {/* Contact Info */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-[#86868b]" />
                    <p className="font-medium text-[#1d1d1f]">Contact</p>
                  </div>
                  <p className="text-sm text-[#86868b]">{selectedOrder.customer_email}</p>
                  {selectedOrder.customer_phone && (
                    <p className="text-sm text-[#86868b]">{selectedOrder.customer_phone}</p>
                  )}
                </div>
              </div>

              {/* Gift Info */}
              {selectedOrder.is_gift && (
                <div className="p-4 bg-pink-50 rounded-xl mb-6 border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-pink-600" />
                    <p className="font-medium text-pink-700">This is a Gift</p>
                  </div>
                  {selectedOrder.gift_message && (
                    <p className="text-sm text-pink-600 italic">"{selectedOrder.gift_message}"</p>
                  )}
                  {selectedOrder.gift_wrap && (
                    <p className="text-xs text-pink-600 mt-1">Gift wrap included</p>
                  )}
                </div>
              )}

              {/* Tracking Info */}
              {selectedOrder.tracking_number && (
                <div className="p-4 bg-blue-50 rounded-xl mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-700">Tracking Number</p>
                      <p className="text-blue-600">{selectedOrder.tracking_number}</p>
                      {selectedOrder.shipping_carrier && (
                        <p className="text-sm text-blue-600">Carrier: {selectedOrder.shipping_carrier}</p>
                      )}
                    </div>
                    {selectedOrder.tracking_url && (
                      <a 
                        href={selectedOrder.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(selectedOrder.invoice_url || selectedOrder.receipt_url) && (
                <div className="flex gap-3 mb-6">
                  {selectedOrder.invoice_url && (
                    <a
                      href={selectedOrder.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1d1d1f] rounded-xl text-sm hover:bg-gray-200 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Invoice
                    </a>
                  )}
                  {selectedOrder.receipt_url && (
                    <a
                      href={selectedOrder.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1d1d1f] rounded-xl text-sm hover:bg-gray-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      View Receipt
                    </a>
                  )}
                </div>
              )}

              {/* Loyalty Points */}
              {(selectedOrder.loyalty_points_used > 0 || selectedOrder.loyalty_points_earned > 0) && (
                <div className="p-4 bg-purple-50 rounded-xl mb-6">
                  <p className="font-medium text-purple-700 mb-2">Loyalty Points</p>
                  <div className="flex gap-4">
                    {selectedOrder.loyalty_points_used > 0 && (
                      <p className="text-sm text-purple-600">Used: {selectedOrder.loyalty_points_used} pts</p>
                    )}
                    {selectedOrder.loyalty_points_earned > 0 && (
                      <p className="text-sm text-purple-600">Earned: +{selectedOrder.loyalty_points_earned} pts</p>
                    )}
                  </div>
                </div>
              )}

              {/* Coupon */}
              {selectedOrder.coupon_code && (
                <div className="p-4 bg-green-50 rounded-xl mb-6">
                  <p className="font-medium text-green-700">Coupon Applied</p>
                  <p className="text-green-600">{selectedOrder.coupon_code}</p>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl mb-6">
                  <p className="font-medium text-yellow-700 mb-1">Order Notes</p>
                  <p className="text-sm text-yellow-600">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Cancellation Reason */}
              {selectedOrder.cancel_reason && (
                <div className="p-4 bg-red-50 rounded-xl mb-6">
                  <p className="font-medium text-red-700 mb-1">Cancellation Reason</p>
                  <p className="text-sm text-red-600">{selectedOrder.cancel_reason}</p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Subtotal ({selectedOrder.item_count} items)</span>
                  <span className="text-[#1d1d1f]">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#86868b]">Tax ({selectedOrder.tax_rate}%)</span>
                    <span className="text-[#1d1d1f]">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#86868b]">Shipping</span>
                  <span className="text-[#1d1d1f]">{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#86868b]">Discount</span>
                    <span className="text-green-600">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                {selectedOrder.loyalty_points_used > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#86868b]">Points Redeemed</span>
                    <span className="text-purple-600">-{formatCurrency(selectedOrder.loyalty_points_used)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-[#1d1d1f]">Total ({selectedOrder.currency})</span>
                  <span className="font-semibold text-[#1d1d1f]">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-[#1d1d1f] mb-4">Order Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-[#86868b]">Order placed</span>
                    <span className="ml-auto text-[#86868b]">{formatDate(selectedOrder.created_at)}</span>
                  </div>
                  {selectedOrder.paid_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-[#86868b]">Payment confirmed</span>
                      <span className="ml-auto text-[#86868b]">{formatDate(selectedOrder.paid_at)}</span>
                    </div>
                  )}
                  {selectedOrder.shipped_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-[#86868b]">Shipped</span>
                      <span className="ml-auto text-[#86868b]">{formatDate(selectedOrder.shipped_at)}</span>
                    </div>
                  )}
                  {selectedOrder.delivered_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-[#86868b]">Delivered</span>
                      <span className="ml-auto text-[#86868b]">{formatDate(selectedOrder.delivered_at)}</span>
                    </div>
                  )}
                  {selectedOrder.cancelled_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-[#86868b]">Cancelled</span>
                      <span className="ml-auto text-[#86868b]">{formatDate(selectedOrder.cancelled_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
