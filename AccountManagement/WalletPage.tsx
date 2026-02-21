
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, 
  Gift, RotateCcw, ChevronLeft, CreditCard, Clock,
  CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, dbConfig } from '../config';

interface WalletData {
  id: string;
  balance: number;
  currency: string;
  cashback_balance: number;
  reward_balance: number;
  daily_limit: number;
  monthly_limit: number;
  is_active: boolean;
  is_frozen: boolean;
  created_at: string;
}

interface WalletTransaction {
  id: string;
  type: 'topup' | 'purchase' | 'refund' | 'bonus' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'cashback';
  amount: number;
  balance_after: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  created_at: string;
  reference_id?: string;
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'topup' | 'purchase' | 'cashback'>('all');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Load wallet
      const { data: walletData, error: walletError } = await supabase
        .from(dbConfig.tables.user_wallets)
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        throw walletError;
      }

      if (walletData) {
        setWallet(walletData);
      } else {
        // Create wallet if not exists
        const { data: newWallet, error: createError } = await supabase
          .from(dbConfig.tables.user_wallets)
          .insert({
            user_id: userData.id,
            balance: 0,
            currency: 'BDT',
            cashback_balance: 0,
            reward_balance: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      }

      // Load transactions
      const { data: txData, error: txError } = await supabase
        .from(dbConfig.tables.user_wallet_transactions)
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txError) throw txError;
      setTransactions(txData || []);

    } catch (err: any) {
      console.error('Failed to load wallet:', err);
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      const topUpAmount = parseFloat(amount);
      const newBalance = (wallet?.balance || 0) + topUpAmount;

      // Create transaction
      const { error: txError } = await supabase
        .from(dbConfig.tables.user_wallet_transactions)
        .insert({
          user_id: userData.id,
          wallet_id: wallet?.id,
          type: 'topup',
          amount: topUpAmount,
          balance_after: newBalance,
          description: 'Wallet top-up',
          status: 'completed'
        });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from(dbConfig.tables.user_wallets)
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet?.id);

      if (walletError) throw walletError;

      setSuccess(`Successfully added ৳${topUpAmount.toFixed(2)} to your wallet`);
      setShowTopUpModal(false);
      setAmount('');
      loadWalletData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to top up wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
      case 'transfer_in':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case 'purchase':
      case 'withdrawal':
      case 'transfer_out':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      case 'cashback':
      case 'bonus':
        return <Gift className="w-5 h-5 text-purple-600" />;
      case 'refund':
        return <RotateCcw className="w-5 h-5 text-blue-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
      case 'transfer_in':
      case 'cashback':
      case 'bonus':
      case 'refund':
        return 'text-green-600';
      case 'purchase':
      case 'withdrawal':
      case 'transfer_out':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'topup') return tx.type === 'topup';
    if (activeTab === 'purchase') return tx.type === 'purchase';
    if (activeTab === 'cashback') return tx.type === 'cashback' || tx.type === 'bonus';
    return true;
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading wallet..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/account-dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-[28px] font-semibold text-[#1d1d1f]">My Wallet</h1>
              <p className="text-[#86868b] text-sm">Manage your balance and transactions</p>
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
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Wallet Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Total Balance</p>
                    <p className="text-2xl font-bold">
                      ৳{(wallet?.balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Currency</p>
                  <p className="font-medium">{wallet?.currency || 'BDT'}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="flex-1 bg-white text-[#6366f1] py-3 px-4 rounded-xl font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Top Up
                </button>
                <button
                  onClick={() => navigate('/payment-methods')}
                  className="flex-1 bg-white/20 text-white py-3 px-4 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </button>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[#86868b] text-sm">Cashback</p>
                    <p className="text-xl font-semibold text-[#1d1d1f]">
                      ৳{(wallet?.cashback_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[#86868b] text-sm">Rewards</p>
                    <p className="text-xl font-semibold text-[#1d1d1f]">
                      ৳{(wallet?.reward_balance || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">Transaction History</h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-4 border-b border-gray-200 overflow-x-auto">
                {(['all', 'topup', 'purchase', 'cashback'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'bg-[#6366f1] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-[#86868b]">No transactions yet</p>
                    <p className="text-sm text-[#86868b] mt-1">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-[#1d1d1f] capitalize">
                              {tx.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-[#86868b]">{tx.description}</p>
                            <p className="text-xs text-[#86868b] mt-1">
                              {new Date(tx.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${getTransactionColor(tx.type)}`}>
                            {['purchase', 'withdrawal', 'transfer_out'].includes(tx.type) ? '-' : '+'}
                            ৳{tx.amount.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 mt-1 justify-end">
                            {getStatusIcon(tx.status)}
                            <span className="text-xs text-[#86868b] capitalize">{tx.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Limits Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Wallet Limits</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#86868b]">Daily Limit</span>
                    <span className="font-medium">৳{wallet?.daily_limit || 50000}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366f1] rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#86868b]">Monthly Limit</span>
                    <span className="font-medium">৳{wallet?.monthly_limit || 500000}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8b5cf6] rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-semibold text-[#1d1d1f] mb-4">Quick Links</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/payment-methods')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <CreditCard className="w-5 h-5 text-[#6366f1]" />
                  <span className="text-[#1d1d1f]">Payment Methods</span>
                </button>
                <button
                  onClick={() => navigate('/order-history')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <Clock className="w-5 h-5 text-[#6366f1]" />
                  <span className="text-[#1d1d1f]">Order History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Top Up Wallet</h2>
            <p className="text-[#86868b] mb-6">Enter the amount you want to add to your wallet</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Amount (৳)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] text-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTopUpModal(false);
                  setAmount('');
                  setError('');
                }}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={isProcessing}
                className="flex-1 py-3 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Top Up'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
