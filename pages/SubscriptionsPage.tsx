
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Check, X, ChevronLeft, Calendar, CreditCard,
  AlertCircle, CheckCircle2, Clock, ArrowRight, Loader2,
  Pause, Play, RotateCcw, AlertTriangle
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface Subscription {
  id: string;
  plan_name: string;
  plan_type: 'free' | 'basic' | 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly' | 'lifetime';
  price: number;
  currency: string;
  status: 'trial' | 'active' | 'paused' | 'cancelled' | 'expired';
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  cancelled_at?: string;
  cancel_reason?: string;
  payment_method?: string;
}

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_code: string;
  description: string;
  features: string[];
  monthly_price: number;
  yearly_price: number;
  lifetime_price?: number;
  currency: string;
  trial_days: number;
  is_popular: boolean;
  is_active: boolean;
}

const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Load user subscriptions
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (subError) throw subError;
      setSubscriptions(subData || []);

      // Load available plans
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });

      if (planError) throw planError;
      setAvailablePlans(planData || []);

    } catch (err: any) {
      console.error('Failed to load subscriptions:', err);
      setError('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setIsProcessing(true);
    setError('');

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: 'User requested cancellation',
          auto_renew: false
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      setSuccess('Subscription cancelled successfully');
      setShowCancelModal(null);
      loadSubscriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleAutoRenew = async (subscription: Subscription) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ auto_renew: !subscription.auto_renew })
        .eq('id', subscription.id);

      if (error) throw error;

      setSuccess(`Auto-renew ${subscription.auto_renew ? 'disabled' : 'enabled'}`);
      loadSubscriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update auto-renew');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'trial':
        return 'bg-blue-100 text-blue-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'trial':
        return <Clock className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const activeSubscriptions = subscriptions.filter(s => ['active', 'trial'].includes(s.status));
  const inactiveSubscriptions = subscriptions.filter(s => ['cancelled', 'expired', 'paused'].includes(s.status));

  if (isLoading) {
    return <LoadingOverlay message="Loading subscriptions..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/account-dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-[28px] font-semibold text-[#1d1d1f]">My Subscriptions</h1>
                <p className="text-[#86868b] text-sm">Manage your plans and billing</p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Active Subscriptions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Active Subscriptions</h2>
          
          {activeSubscriptions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1d1d1f] mb-2">No Active Subscriptions</h3>
              <p className="text-[#86868b] mb-4">You don't have any active subscriptions yet</p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors"
              >
                Browse Plans
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-xl flex items-center justify-center">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1d1d1f]">{sub.plan_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                            {getStatusIcon(sub.status)}
                            {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                          {sub.status === 'trial' && sub.trial_ends_at && (
                            <span className="text-sm text-[#86868b]">
                              Trial ends {formatDate(sub.trial_ends_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#1d1d1f]">
                        {sub.currency} {sub.price}
                      </p>
                      <p className="text-sm text-[#86868b]">/{sub.billing_cycle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-[#86868b]">Current Period</p>
                      <p className="font-medium text-[#1d1d1f]">
                        {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#86868b]">Payment Method</p>
                      <p className="font-medium text-[#1d1d1f] flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {sub.payment_method || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleAutoRenew(sub)}
                        disabled={isProcessing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                          sub.auto_renew
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {sub.auto_renew ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Auto-renew {sub.auto_renew ? 'On' : 'Off'}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowCancelModal(sub.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Subscriptions */}
        {inactiveSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Past Subscriptions</h2>
            <div className="grid gap-4">
              {inactiveSubscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-200 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1d1d1f]">{sub.plan_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                          {getStatusIcon(sub.status)}
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#1d1d1f]">{sub.currency} {sub.price}</p>
                      <p className="text-sm text-[#86868b]">/{sub.billing_cycle}</p>
                      {sub.cancelled_at && (
                        <p className="text-xs text-[#86868b]">
                          Cancelled {formatDate(sub.cancelled_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] text-center mb-2">Cancel Subscription?</h2>
            <p className="text-[#86868b] text-center mb-6">
              You'll continue to have access until the end of your billing period. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => handleCancelSubscription(showCancelModal)}
                disabled={isProcessing}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#1d1d1f]">Choose Your Plan</h2>
                <p className="text-[#86868b]">Upgrade to unlock more features</p>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 border-2 transition-all ${
                    plan.is_popular
                      ? 'border-[#6366f1] bg-[#6366f1]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-[#6366f1] text-white text-xs font-medium rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{plan.plan_name}</h3>
                    <p className="text-[#86868b] text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-[#1d1d1f]">{plan.currency} {plan.monthly_price}</span>
                      <span className="text-[#86868b]">/mo</span>
                    </div>
                    {plan.yearly_price > 0 && (
                      <p className="text-sm text-[#86868b] mt-1">
                        or {plan.currency} {plan.yearly_price}/year
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#1d1d1f]">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/payment-methods')}
                    className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                      plan.is_popular
                        ? 'bg-[#6366f1] text-white hover:bg-[#5558e0]'
                        : 'bg-gray-100 text-[#1d1d1f] hover:bg-gray-200'
                    }`}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
