
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, Award, Star, Trophy, Crown, ChevronLeft, Zap,
  Target, Flame, CheckCircle2, AlertCircle, Loader2,
  TrendingUp, Calendar, History, Gem, Medal
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors } from '../config';

interface LoyaltyData {
  id: string;
  points_balance: number;
  points_earned: number;
  points_spent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_updated_at: string;
}

interface Badge {
  id: string;
  badge_name: string;
  badge_slug: string;
  description: string;
  icon_url?: string;
  icon_svg?: string;
  category: 'purchase' | 'loyalty' | 'social' | 'referral' | 'engagement' | 'milestone' | 'special' | 'seasonal';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points_reward: number;
  earned_at: string;
  is_displayed: boolean;
}

interface LoyaltyTransaction {
  id: string;
  type: 'earn' | 'spend' | 'expire' | 'bonus' | 'adjust';
  points: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

const RewardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Load loyalty points
      const { data: loyaltyData, error: loyaltyError } = await supabase
        .from('user_loyalty_points')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (loyaltyError && loyaltyError.code !== 'PGRST116') {
        throw loyaltyError;
      }

      if (loyaltyData) {
        setLoyalty(loyaltyData);
      } else {
        // Create default loyalty record
        const { data: newLoyalty } = await supabase
          .from('user_loyalty_points')
          .insert({
            user_id: userData.id,
            points_balance: 0,
            points_earned: 0,
            points_spent: 0,
            tier: 'bronze'
          })
          .select()
          .single();
        setLoyalty(newLoyalty);
      }

      // Load badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userData.id)
        .order('earned_at', { ascending: false });

      if (badgesError) throw badgesError;
      
      if (badgesData) {
        setBadges(badgesData.map((ub: any) => ({
          ...ub.badge,
          earned_at: ub.earned_at,
          is_displayed: ub.is_displayed
        })));
      }

      // Load transactions
      const { data: txData, error: txError } = await supabase
        .from('user_loyalty_transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) throw txError;
      setTransactions(txData || []);

    } catch (err: any) {
      console.error('Failed to load rewards:', err);
      setError('Failed to load rewards data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-700 to-amber-600';
      case 'silver':
        return 'from-gray-400 to-gray-300';
      case 'gold':
        return 'from-yellow-500 to-yellow-400';
      case 'platinum':
        return 'from-cyan-500 to-cyan-400';
      case 'diamond':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-400';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Medal className="w-6 h-6" />;
      case 'silver':
        return <Award className="w-6 h-6" />;
      case 'gold':
        return <Trophy className="w-6 h-6" />;
      case 'platinum':
        return <Crown className="w-6 h-6" />;
      case 'diamond':
        return <Gem className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-600';
      case 'uncommon':
        return 'bg-green-100 text-green-600';
      case 'rare':
        return 'bg-blue-100 text-blue-600';
      case 'epic':
        return 'bg-purple-100 text-purple-600';
      case 'legendary':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'purchase':
        return <Gift className="w-4 h-4" />;
      case 'loyalty':
        return <Star className="w-4 h-4" />;
      case 'social':
        return <Zap className="w-4 h-4" />;
      case 'milestone':
        return <Target className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'spend':
        return <Gift className="w-5 h-5 text-red-600" />;
      case 'bonus':
        return <Star className="w-5 h-5 text-purple-600" />;
      default:
        return <History className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading rewards..." />;
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
              <h1 className="text-[28px] font-semibold text-[#1d1d1f]">Rewards & Badges</h1>
              <p className="text-[#86868b] text-sm">Your achievements and loyalty points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loyalty Tier Card */}
        <div className={`bg-gradient-to-r ${getTierColor(loyalty?.tier || 'bronze')} rounded-2xl p-8 text-white mb-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {getTierIcon(loyalty?.tier || 'bronze')}
              </div>
              <div>
                <p className="text-white/80 text-sm uppercase tracking-wide">Current Tier</p>
                <h2 className="text-3xl font-bold capitalize">{loyalty?.tier || 'Bronze'}</h2>
                <p className="text-white/80 text-sm mt-1">
                  Member since {loyalty?.tier_updated_at ? new Date(loyalty.tier_updated_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">Points Balance</p>
              <p className="text-4xl font-bold">{loyalty?.points_balance?.toLocaleString() || 0}</p>
              <p className="text-white/80 text-sm">points</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-[#86868b] text-sm">Total Earned</p>
            </div>
            <p className="text-2xl font-bold text-[#1d1d1f]">{loyalty?.points_earned?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-[#86868b] text-sm">Points Spent</p>
            </div>
            <p className="text-2xl font-bold text-[#1d1d1f]">{loyalty?.points_spent?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-[#86868b] text-sm">Badges Earned</p>
            </div>
            <p className="text-2xl font-bold text-[#1d1d1f]">{badges.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'badges', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Badges */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Recent Badges</h3>
                <button
                  onClick={() => setActiveTab('badges')}
                  className="text-[#6366f1] font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              
              {badges.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-[#86868b]">No badges earned yet</p>
                  <p className="text-sm text-[#86868b]">Complete activities to earn badges</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.slice(0, 4).map((badge) => (
                    <div key={badge.id} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                        {getCategoryIcon(badge.category)}
                      </div>
                      <h4 className="font-medium text-[#1d1d1f] text-sm">{badge.badge_name}</h4>
                      <p className="text-xs text-[#86868b] capitalize">{badge.rarity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1d1d1f]">Recent Activity</h3>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-[#6366f1] font-medium hover:underline"
                >
                  View All
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-[#86868b]">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-medium text-[#1d1d1f] capitalize">{tx.type}</p>
                          <p className="text-sm text-[#86868b]">{tx.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === 'earn' || tx.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'earn' || tx.type === 'bonus' ? '+' : '-'}{tx.points}
                        </p>
                        <p className="text-xs text-[#86868b]">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            {badges.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1d1d1f] mb-2">No Badges Yet</h3>
                <p className="text-[#86868b]">Complete activities and milestones to earn badges</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                      {getCategoryIcon(badge.category)}
                    </div>
                    <h4 className="font-semibold text-[#1d1d1f] text-center mb-1">{badge.badge_name}</h4>
                    <p className="text-sm text-[#86868b] text-center mb-2">{badge.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRarityColor(badge.rarity)}`}>
                        {badge.rarity}
                      </span>
                      <span className="text-xs text-[#86868b]">+{badge.points_reward} pts</span>
                    </div>
                    <p className="text-xs text-[#86868b] text-center mt-2">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1d1d1f] mb-2">No Activity Yet</h3>
                <p className="text-[#86868b]">Your points activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1d1d1f] capitalize">{tx.type}</p>
                        <p className="text-sm text-[#86868b]">{tx.reason}</p>
                        <p className="text-xs text-[#86868b]">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'earn' || tx.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'earn' || tx.type === 'bonus' ? '+' : '-'}{tx.points}
                      </p>
                      <p className="text-sm text-[#86868b]">Balance: {tx.balance_after}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;
