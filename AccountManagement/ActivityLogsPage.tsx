
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronLeft, Smartphone, Globe, Shield, AlertTriangle, User, Lock, CreditCard, ShoppingBag, LogIn, LogOut, Edit, Trash2, Eye, Filter, Download, X, Check } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, dbConfig } from '../config';

type ActivityType = 'login' | 'logout' | 'profile_update' | 'password_change' | 'security_change' | 'payment_added' | 'payment_removed' | 'order_placed' | 'order_cancelled' | 'device_added' | 'device_removed' | 'privacy_change' | 'notification_change' | 'app_connected' | 'app_disconnected' | 'suspicious';

interface ActivityLog {
  id: string;
  action: ActivityType;
  description: string;
  details: Record<string, any>;
  device_type: string;
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  created_at: string;
  is_suspicious: boolean;
}

const ActivityLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filter, dateRange]);

  const loadActivityLogs = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from(dbConfig.tables.user_activity_logs)
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        setLogs(data.map((log: any) => ({
          id: log.id,
          action: log.action,
          description: getActivityDescription(log.action, log.details),
          details: log.details || {},
          device_type: log.device_type || 'unknown',
          device_name: log.device_name || 'Unknown Device',
          browser: log.browser || 'Unknown',
          os: log.os || 'Unknown',
          ip_address: log.ip_address || '***.***.***.***',
          location: log.location || 'Unknown',
          created_at: log.created_at,
          is_suspicious: log.is_suspicious || false
        })));
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityDescription = (action: ActivityType, details: any): string => {
    const descriptions: Record<ActivityType, string> = {
      login: 'Signed in to your account',
      logout: 'Signed out from your account',
      profile_update: 'Updated profile information',
      password_change: 'Changed account password',
      security_change: 'Modified security settings',
      payment_added: 'Added new payment method',
      payment_removed: 'Removed payment method',
      order_placed: `Placed order #${details?.order_number || 'N/A'}`,
      order_cancelled: `Cancelled order #${details?.order_number || 'N/A'}`,
      device_added: 'New device connected',
      device_removed: 'Device disconnected',
      privacy_change: 'Updated privacy settings',
      notification_change: 'Changed notification preferences',
      app_connected: `Connected ${details?.app_name || 'app'}`,
      app_disconnected: `Disconnected ${details?.app_name || 'app'}`,
      suspicious: 'Suspicious activity detected'
    };
    return descriptions[action] || 'Account activity';
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.action === filter);
    }

    // Filter by date
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (dateRange === 'today') {
        cutoff.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
      }
      
      filtered = filtered.filter(log => new Date(log.created_at) >= cutoff);
    }

    setFilteredLogs(filtered);
  };

  const getActivityIcon = (action: ActivityType) => {
    switch (action) {
      case 'login': return <LogIn className="w-5 h-5" />;
      case 'logout': return <LogOut className="w-5 h-5" />;
      case 'profile_update': return <User className="w-5 h-5" />;
      case 'password_change':
      case 'security_change': return <Lock className="w-5 h-5" />;
      case 'payment_added':
      case 'payment_removed': return <CreditCard className="w-5 h-5" />;
      case 'order_placed':
      case 'order_cancelled': return <ShoppingBag className="w-5 h-5" />;
      case 'device_added':
      case 'device_removed': return <Smartphone className="w-5 h-5" />;
      case 'privacy_change': return <Shield className="w-5 h-5" />;
      case 'notification_change': return <Edit className="w-5 h-5" />;
      case 'app_connected':
      case 'app_disconnected': return <Globe className="w-5 h-5" />;
      case 'suspicious': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (action: ActivityType, isSuspicious: boolean) => {
    if (isSuspicious) return 'bg-red-100 text-red-700';
    
    switch (action) {
      case 'login': return 'bg-green-100 text-green-700';
      case 'logout': return 'bg-gray-100 text-gray-700';
      case 'profile_update':
      case 'password_change':
      case 'security_change': return 'bg-blue-100 text-blue-700';
      case 'payment_added':
      case 'payment_removed': return 'bg-cyan-100 text-cyan-700';
      case 'order_placed': return 'bg-teal-100 text-teal-700';
      case 'order_cancelled': return 'bg-orange-100 text-orange-700';
      case 'device_added':
      case 'device_removed': return 'bg-purple-100 text-purple-700';
      case 'privacy_change': return 'bg-amber-100 text-amber-700';
      case 'suspicious': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Action', 'Description', 'Device', 'Location', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.action,
        `"${log.description}"`,
        `"${log.device_name}"`,
        `"${log.location}"`,
        log.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activityTypes: { value: ActivityType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Activities' },
    { value: 'login', label: 'Sign Ins' },
    { value: 'logout', label: 'Sign Outs' },
    { value: 'profile_update', label: 'Profile Updates' },
    { value: 'password_change', label: 'Password Changes' },
    { value: 'security_change', label: 'Security Changes' },
    { value: 'payment_added', label: 'Payment Methods' },
    { value: 'order_placed', label: 'Orders' },
    { value: 'device_added', label: 'Devices' },
    { value: 'suspicious', label: 'Suspicious' }
  ];

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

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
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Activity Log</h1>
                <p className="text-[#86868b]">Track everything that happens in your account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Activities', value: logs.length },
            { label: 'Sign Ins', value: logs.filter(l => l.action === 'login').length },
            { label: 'This Week', value: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
            { label: 'Suspicious', value: logs.filter(l => l.is_suspicious).length, alert: true }
          ].map((stat, i) => (
            <div key={i} className={`rounded-2xl p-4 shadow-sm ${stat.alert ? 'bg-red-50 border border-red-200' : 'bg-white'}`}>
              <p className={`text-sm ${stat.alert ? 'text-red-600' : 'text-[#86868b]'}`}>{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.alert ? 'text-red-700' : 'text-[#1d1d1f]'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ActivityType | 'all')}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-[#0071e3] outline-none bg-white"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              {(['all', 'today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    dateRange === range
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-gray-100 text-[#1d1d1f] hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#1d1d1f] rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Recent Activity</h2>

          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                onClick={() => {
                  setSelectedLog(log);
                  setShowDetailModal(true);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                  log.is_suspicious 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getActivityColor(log.action, log.is_suspicious)}`}>
                    {getActivityIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1d1d1f]">{log.description}</p>
                      {log.is_suspicious && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          Suspicious
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#86868b]">
                      {log.device_name} • {log.browser} • {log.location}
                    </p>
                    <p className="text-xs text-[#86868b] mt-1">
                      {formatDate(log.created_at)} • IP: {log.ip_address}
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-[#86868b]">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activity found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1d1d1f]">Activity Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl ${getActivityColor(selectedLog.action, selectedLog.is_suspicious)}`}>
                  <div className="flex items-center gap-3">
                    {getActivityIcon(selectedLog.action)}
                    <p className="font-semibold">{selectedLog.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">Date & Time</span>
                    <span className="text-[#1d1d1f]">{formatDate(selectedLog.created_at)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">Device</span>
                    <span className="text-[#1d1d1f]">{selectedLog.device_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">Browser</span>
                    <span className="text-[#1d1d1f]">{selectedLog.browser}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">Operating System</span>
                    <span className="text-[#1d1d1f]">{selectedLog.os}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">Location</span>
                    <span className="text-[#1d1d1f]">{selectedLog.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-[#86868b]">IP Address</span>
                    <span className="text-[#1d1d1f]">{selectedLog.ip_address}</span>
                  </div>
                </div>

                {selectedLog.is_suspicious && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-red-700">Suspicious Activity</p>
                        <p className="text-sm text-red-600">
                          This activity was flagged as suspicious. If you didn't perform this action, 
                          please change your password immediately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsPage;
