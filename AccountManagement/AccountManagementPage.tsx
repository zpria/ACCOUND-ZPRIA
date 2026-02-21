import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, Bell, Lock, ShoppingBag,
  Heart, Wallet, Ticket, Award, Zap, MapPin, Smartphone,
  Globe, Palette, FileText, HelpCircle, ChevronRight,
  TrendingUp, Activity, Star, Gift, Crown, Target,
  Users, MessageSquare, Calendar, Clock, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, Settings,
  LogOut, RefreshCw, Eye, EyeOff, Copy, Check,
  Link2
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import { UserProfile } from '../types';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, dbConfig } from '../config';

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  cartCount: number;
  activeSubscriptions: number;
  unreadNotifications: number;
  loyaltyPoints: number;
  currentStreak: number;
}

interface RecentActivity {
  id: string;
  type: 'login' | 'purchase' | 'update' | 'security' | 'order';
  description: string;
  timestamp: string;
  icon: any;
}

const AccountManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    cartCount: 0,
    activeSubscriptions: 0,
    unreadNotifications: 0,
    loyaltyPoints: 0,
    currentStreak: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginId, setShowLoginId] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser) as UserProfile;
      setUser(userData);

      // Load dashboard stats in parallel
      await Promise.all([
        loadUserStats(userData.id),
        loadRecentActivity(userData.id)
      ]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      // Get purchase stats
      const { data: purchases } = await supabase
        .from(dbConfig.tables.user_purchases)
        .select('total_price')
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get wishlist count
      const { count: wishlistCount } = await supabase
        .from(dbConfig.tables.user_wishlists)
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Get cart count
      const { count: cartCount } = await supabase
        .from(dbConfig.tables.user_carts)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('saved_for_later', false);

      // Get active subscriptions
      const { count: activeSubs } = await supabase
        .from(dbConfig.tables.user_subscriptions)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .in('status', ['active', 'trial']);

      // Get unread notifications
      const { count: unreadNotifs } = await supabase
        .from(dbConfig.tables.user_notifications)
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_opened', false);

      // Get streak
      const { data: streak } = await supabase
        .from(dbConfig.tables.user_streaks)
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      // Get wallet balance as loyalty points
      const { data: wallet } = await supabase
        .from(dbConfig.tables.user_wallets)
        .select('balance')
        .eq('user_id', userId)
        .single();

      const totalSpent = purchases?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;

      setStats({
        totalOrders: purchases?.length || 0,
        totalSpent,
        wishlistCount: wishlistCount || 0,
        cartCount: cartCount || 0,
        activeSubscriptions: activeSubs || 0,
        unreadNotifications: unreadNotifs || 0,
        loyaltyPoints: 0, // TODO: Fetch from user_loyalty_points table
        currentStreak: streak?.current_streak || 0
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadRecentActivity = async (userId: string) => {
    try {
      const { data: logs } = await supabase
        .from(dbConfig.tables.user_activity_logs)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (logs) {
        const activities: RecentActivity[] = logs.map((log: any) => ({
          id: log.id,
          type: getActivityType(log.action),
          description: getActivityDescription(log.action, log.details),
          timestamp: log.created_at,
          icon: getActivityIcon(log.action)
        }));
        setRecentActivity(activities);
      }
    } catch (err) {
      console.error('Failed to load activity:', err);
    }
  };

  const getActivityType = (action: string): RecentActivity['type'] => {
    if (action.includes('login')) return 'login';
    if (action.includes('purchase')) return 'purchase';
    if (action.includes('security') || action.includes('password')) return 'security';
    if (action.includes('order')) return 'order';
    return 'update';
  };

  const getActivityDescription = (action: string, details: any): string => {
    const descriptions: Record<string, string> = {
      'login': 'Signed in from a new device',
      'logout': 'Signed out',
      'password_change': 'Password was changed',
      'profile_update': 'Profile information updated',
      'purchase': 'Made a new purchase',
      'wishlist_add': 'Added item to wishlist',
      'cart_add': 'Added item to cart'
    };
    return descriptions[action] || action.replace(/_/g, ' ');
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('login')) return Shield;
    if (action.includes('purchase')) return ShoppingBag;
    if (action.includes('security')) return Lock;
    if (action.includes('order')) return FileText;
    return Activity;
  };

  const copyLoginId = () => {
    if (user?.login_id) {
      navigator.clipboard.writeText(user.login_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { icon: ShoppingBag, label: 'My Orders', path: '/account/orders', color: 'bg-blue-500' },
    { icon: Heart, label: 'Wishlist', path: '/account/wishlist', color: 'bg-pink-500', badge: stats.wishlistCount },
    { icon: CreditCard, label: 'Payments', path: '/account/payments', color: 'bg-green-500' },
    { icon: Shield, label: 'Security', path: '/account/security', color: 'bg-purple-500' },
    { icon: MapPin, label: 'Addresses', path: '/account/addresses', color: 'bg-red-500' },
    { icon: Wallet, label: 'Wallet', path: '/account/wallet', color: 'bg-cyan-500' },
    { icon: Gift, label: 'Rewards', path: '/account/rewards', color: 'bg-yellow-500' },
  ];

  const accountSections = [
    {
      title: 'Personal Information',
      icon: User,
      path: '/account/profile',
      description: 'Manage your profile, bio, and personal details'
    },
    {
      title: 'Security Settings',
      icon: ShieldCheck,
      path: '/account/security',
      description: 'Password, 2FA, and login security'
    },
    {
      title: 'Privacy Controls',
      icon: Eye,
      path: '/account/privacy',
      description: 'Data sharing and privacy preferences'
    },
    {
      title: 'Connected Apps',
      icon: Globe,
      path: '/account/apps',
      description: 'Manage SSO and app connections'
    },
    {
      title: 'Devices',
      icon: Smartphone,
      path: '/account/devices',
      description: 'Active sessions and trusted devices'
    },
    {
      title: 'Preferences',
      icon: Palette,
      path: '/account/preferences',
      description: 'Theme, language, and display settings'
    }
  ];

  const additionalServices = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Update your name, email, phone number, and other personal details',
      icon: User,
      path: '/account/profile',
      color: 'bg-blue-500',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Manage passwords, two-factor authentication, and active sessions',
      icon: Shield,
      path: '/account/security',
      color: 'bg-green-500',
    },
    {
      id: 'devices',
      title: 'Devices',
      description: 'View and manage devices signed in to your account',
      icon: Smartphone,
      path: '/account/devices',
      color: 'bg-purple-500',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      description: 'Control your privacy settings and manage your data',
      icon: Lock,
      path: '/account/privacy',
      color: 'bg-orange-500',
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      description: 'Manage your credit cards, bKash, Nagad, and other payment options',
      icon: CreditCard,
      path: '/account/payments',
      color: 'bg-cyan-500',
    },
    {
      id: 'orders',
      title: 'Order History',
      description: 'View and track your purchases, download invoices',
      icon: ShoppingBag,
      path: '/account/orders',
      color: 'bg-teal-500',
    },
    {
      id: 'apps',
      title: 'Connected Apps',
      description: 'Manage SSO connections to other ZPRIA products',
      icon: Link2,
      path: '/account/apps',
      color: 'bg-indigo-500',
    },
    {
      id: 'activity',
      title: 'Activity Log',
      description: 'Track everything that happens in your account',
      icon: Activity,
      path: '/account/activity',
      color: 'bg-violet-500',
    },
  ];

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00c6ff] flex items-center justify-center text-white text-3xl font-bold">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    `${user?.firstName?.[0]}${user?.lastName?.[0]}`
                  )}
                </div>
                {stats.currentStreak > 0 && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white">
                    <Zap className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-[32px] font-bold text-[#1d1d1f]">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-[#86868b] mt-1">{user?.email}</p>
                
                {/* Login ID with copy */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-[#86868b]">Login ID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {showLoginId ? user?.login_id : '••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowLoginId(!showLoginId)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {showLoginId ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                  </button>
                  <button
                    onClick={copyLoginId}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3">
                  {stats.currentStreak > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {stats.currentStreak} Day Streak
                    </span>
                  )}
                  {stats.activeSubscriptions > 0 && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1d1d1f]">{stats.totalOrders}</p>
                <p className="text-sm text-[#86868b]">Orders</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1d1d1f]">{formatCurrency(stats.totalSpent)}</p>
                <p className="text-sm text-[#86868b]">Total Spent</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1d1d1f]">{stats.loyaltyPoints}</p>
                <p className="text-sm text-[#86868b]">Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1d1d1f]">{action.label}</span>
                {action.badge ? (
                  <span className="bg-[#0071e3] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {action.badge}
                  </span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Account Sections */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Account Settings</h2>
            {accountSections.map((section) => (
              <button
                key={section.title}
                onClick={() => navigate(section.path)}
                className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                  <section.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-[#1d1d1f]">{section.title}</h3>
                  <p className="text-sm text-[#86868b]">{section.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
            
            {/* Additional Services */}
            <div className="pt-6">
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Additional Services</h2>
              {additionalServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => navigate(service.path)}
                    className="w-full bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-[#1d1d1f]">{service.title}</h3>
                      <p className="text-sm text-[#86868b]">{service.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1d1d1f]">Recent Activity</h3>
                <button
                  onClick={() => navigate('/account/activity')}
                  className="text-sm text-[#0071e3] hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-[#86868b] text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <activity.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1d1d1f] truncate">{activity.description}</p>
                        <p className="text-xs text-[#86868b]">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-[#1d1d1f] mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#86868b]">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user?.accountStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#86868b]">Email Verified</span>
                  {user?.isEmailVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#86868b]">2FA Enabled</span>
                  {user?.twoFactorEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#86868b]">Member Since</span>
                  <span className="text-sm text-[#1d1d1f]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            {stats.activeSubscriptions > 0 && (
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Premium Active</span>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  You have {stats.activeSubscriptions} active subscription{stats.activeSubscriptions > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => navigate('/account/subscriptions')}
                  className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Manage Subscriptions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;