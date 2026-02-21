
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Smartphone, ChevronLeft, Plus, Trash2, Star, Check, X, Shield, Lock } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, DB_CONFIG } from '../config';

type PaymentType = 'card' | 'bkash' | 'nagad' | 'rocket' | 'upay';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  name: string;
  last4?: string;
  expiry?: string;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  details?: {
    card_brand?: string;
    phone_number?: string;
  };
}

const PaymentMethodsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Add payment form states
  const [selectedType, setSelectedType] = useState<PaymentType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
    loadPaymentHistory();
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      // First try to get location from user profile
      const savedUser = localStorage.getItem('zpria_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.country) {
          setUserCountry(userData.country);
          return;
        }
      }

      // Fallback: use IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json();
      if (locationData.country) {
        setUserCountry(locationData.country);
      } else {
        // Default to showing all options if location detection fails
        setUserCountry('US'); // Default to US if unable to detect
      }
    } catch (error) {
      console.warn('Could not detect user location, defaulting to showing all payment methods', error);
      setUserCountry('US'); // Default to US if error occurs
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
        .select('*')
        .eq('user_id', userData.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPaymentMethods(data.map((pm: any) => ({
          id: pm.id,
          type: pm.type,
          name: pm.name || getPaymentTypeLabel(pm.type),
          last4: pm.last4,
          expiry: pm.expiry,
          is_default: pm.is_default || false,
          is_verified: pm.is_verified || false,
          created_at: pm.created_at,
          details: pm.details || {}
        })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PURCHASES)
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setPaymentHistory(data);
      }
    } catch (err: any) {
      console.error('Failed to load payment history:', err);
    }
  };

  const getPaymentTypeLabel = (type: PaymentType): string => {
    const labels: Record<PaymentType, string> = {
      card: 'Credit/Debit Card',
      bkash: 'bKash',
      nagad: 'Nagad',
      rocket: 'Rocket',
      upay: 'Upay'
    };
    return labels[type];
  };

  const getPaymentIcon = (type: PaymentType) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-6 h-6" />;
      case 'bkash':
      case 'nagad':
      case 'rocket':
      case 'upay':
        return <Smartphone className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleAddPayment = async () => {
    setIsSaving(true);
    setError('');

    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) throw new Error('Not logged in');
      
      const userData = JSON.parse(savedUser);

      let paymentData: any = {
        user_id: userData.id,
        type: selectedType,
        is_default: makeDefault || paymentMethods.length === 0,
        is_verified: false,
        created_at: new Date().toISOString()
      };

      if (selectedType === 'card') {
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
          throw new Error('Please fill in all card details');
        }
        paymentData.name = cardName;
        paymentData.last4 = cardNumber.replace(/\s/g, '').slice(-4);
        paymentData.expiry = cardExpiry;
        paymentData.details = {
          card_brand: getCardBrand(cardNumber)
        };
      } else {
        if (!mobileNumber) {
          throw new Error('Please enter mobile number');
        }
        paymentData.name = getPaymentTypeLabel(selectedType);
        paymentData.details = {
          phone_number: mobileNumber
        };
      }

      const { error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
        .insert([paymentData]);

      if (error) throw error;

      // If this is default, unset others
      if (makeDefault || paymentMethods.length === 0) {
        await supabase
          .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
          .update({ is_default: false })
          .eq('user_id', userData.id)
          .neq('id', paymentData.id);
      }

      setSuccess('Payment method added successfully');
      setShowAddModal(false);
      resetForm();
      await loadPaymentMethods();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getCardBrand = (number: string): string => {
    const clean = number.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    if (clean.startsWith('3')) return 'amex';
    if (clean.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setMobileNumber('');
    setMakeDefault(false);
    setSelectedType('card');
  };

  const handleSetDefault = async (id: string) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Unset all others
      await supabase
        .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
        .update({ is_default: false })
        .eq('user_id', userData.id);

      // Set this one as default
      await supabase
        .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
        .update({ is_default: true })
        .eq('id', id);

      setPaymentMethods(methods => 
        methods.map(m => ({ ...m, is_default: m.id === id }))
      );

      setSuccess('Default payment method updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from(DB_CONFIG.TABLES.USER_PAYMENT_METHODS)
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      setSuccess('Payment method removed');
      setShowDeleteConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[800px] mx-auto">
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
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Payment Methods</h1>
                <p className="text-[#86868b]">Manage your payment options</p>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Security Note */}
        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700">
              Your payment information is securely encrypted. We never store your full card details.
            </p>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Payment History</h2>
          
          <div className="space-y-4">
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1d1d1f]">
                        {payment.product_name || 'Purchase'}
                      </p>
                      <p className="text-sm text-[#86868b]">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#1d1d1f]">
                        ৳{payment.total_price?.toFixed(2) || '0.00'}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#86868b]">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payment history found</p>
                <p className="text-sm mt-1">Your payment history will appear here</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Saved Methods</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0051a3] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Method
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`p-4 rounded-2xl border-2 transition-all ${
                  method.is_default 
                    ? 'border-[#0071e3] bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      method.is_default ? 'bg-[#0071e3] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getPaymentIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1d1d1f]">{method.name}</p>
                        {method.is_default && (
                          <span className="px-2 py-0.5 bg-[#0071e3] text-white text-xs rounded-full">
                            Default
                          </span>
                        )}
                        {!method.is_verified && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      {method.type === 'card' && (
                        <p className="text-sm text-[#86868b]">
                          •••• {method.last4} {method.expiry && `• Expires ${method.expiry}`}
                        </p>
                      )}
                      {method.details?.phone_number && (
                        <p className="text-sm text-[#86868b]">
                          {method.details.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="p-2 text-gray-400 hover:text-[#0071e3] transition-colors"
                        title="Set as default"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(method.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paymentMethods.length === 0 && (
              <div className="text-center py-12 text-[#86868b]">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No payment methods saved</p>
                <p className="text-sm mt-1">Add a payment method to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Payment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1d1d1f]">Add Payment Method</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payment Type Selection */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {(['card', 'bkash', 'nagad'] as PaymentType[])
                  .filter(type => {
                    // Show bKash and Nagad only if user is in Bangladesh
                    if (type === 'bkash' || type === 'nagad') {
                      return userCountry === 'BD' || userCountry === 'Bangladesh';
                    }
                    // Always show card option
                    return true;
                  })
                  .map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedType === type
                          ? 'border-[#0071e3] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {getPaymentIcon(type)}
                        <span className="text-xs font-medium">
                          {type === 'card' ? 'Card' : type}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Card Form */}
              {selectedType === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#86868b] mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#86868b] mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#86868b] mb-2">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#86868b] mb-2">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        placeholder="123"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Payment Form */}
              {selectedType !== 'card' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-[#86868b] mb-2">
                      Enter your {getPaymentTypeLabel(selectedType)} account number
                    </p>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Default Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mt-6">
                <div>
                  <p className="font-medium text-[#1d1d1f]">Set as default</p>
                  <p className="text-sm text-[#86868b]">Use this for future payments</p>
                </div>
                <button
                  onClick={() => setMakeDefault(!makeDefault)}
                  className={`w-14 h-8 rounded-full transition-all ${makeDefault ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${makeDefault ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0051a3] transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Adding...' : 'Add Method'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-[#1d1d1f]">Remove Payment Method?</h3>
              </div>
              <p className="text-[#86868b] mb-6">
                This payment method will be removed from your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
