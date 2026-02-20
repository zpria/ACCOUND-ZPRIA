
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ChevronLeft, Shield, ExternalLink, X, Check, AlertTriangle, RefreshCw, Lock, Globe, Smartphone, Zap } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface ConnectedApp {
  id: string;
  app_name: string;
  app_icon?: string;
  app_description: string;
  connected_at: string;
  last_used: string;
  permissions: string[];
  is_active: boolean;
  app_url?: string;
}

interface AvailableApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  benefits: string[];
}

const ConnectedAppsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [connectedApps, setConnectedApps] = useState<ConnectedApp[]>([]);
  const [availableApps, setAvailableApps] = useState<AvailableApp[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Load connected apps
      const { data: connectedData, error: connectedError } = await supabase
        .from('user_connected_apps')
        .select(`
          *,
          app:app_id (*)
        `)
        .eq('user_id', userData.id)
        .eq('is_active', true);

      if (connectedError) throw connectedError;

      if (connectedData) {
        setConnectedApps(connectedData.map((conn: any) => ({
          id: conn.id,
          app_name: conn.app?.name || 'Unknown App',
          app_icon: conn.app?.icon,
          app_description: conn.app?.description || '',
          connected_at: conn.connected_at,
          last_used: conn.last_used || conn.connected_at,
          permissions: conn.permissions || [],
          is_active: conn.is_active,
          app_url: conn.app?.app_url
        })));
      }

      // Load available ZPRIA apps
      setAvailableApps([
        {
          id: 'zpria-social',
          name: 'ZPRIA Social',
          icon: '👥',
          description: 'Connect with friends and share moments',
          category: 'Social',
          benefits: ['Single sign-on', 'Sync profile', 'Share posts']
        },
        {
          id: 'zpria-ai',
          name: 'ZPRIA AI',
          icon: '🤖',
          description: 'AI-powered assistant and tools',
          category: 'Productivity',
          benefits: ['Personalized AI', 'Saved preferences', 'Cross-device sync']
        },
        {
          id: 'zpria-shop',
          name: 'ZPRIA Shop',
          icon: '🛒',
          description: 'Shop products and track orders',
          category: 'Shopping',
          benefits: ['Saved addresses', 'Payment methods', 'Order history']
        },
        {
          id: 'zpria-learn',
          name: 'ZPRIA Learn',
          icon: '📚',
          description: 'Online courses and learning',
          category: 'Education',
          benefits: ['Progress sync', 'Certificates', 'Bookmarks']
        },
        {
          id: 'zpria-cloud',
          name: 'ZPRIA Cloud',
          icon: '☁️',
          description: 'Store and access your files',
          category: 'Storage',
          benefits: ['5GB free storage', 'File sync', 'Secure backup']
        },
        {
          id: 'zpria-music',
          name: 'ZPRIA Music',
          icon: '🎵',
          description: 'Stream music and podcasts',
          category: 'Entertainment',
          benefits: ['Playlists sync', 'Recommendations', 'Offline mode']
        }
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('user_connected_apps')
        .update({ is_active: false, disconnected_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;

      setConnectedApps(apps => apps.filter(app => app.id !== connectionId));
      setSuccess('App disconnected successfully');
      setShowDisconnectConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConnect = async (appId: string) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Check if already connected
      const existing = connectedApps.find(app => app.id === appId);
      if (existing) {
        setError('This app is already connected');
        return;
      }

      // Create connection
      const { error } = await supabase
        .from('user_connected_apps')
        .insert([{
          user_id: userData.id,
          app_id: appId,
          connected_at: new Date().toISOString(),
          permissions: ['profile', 'email'],
          is_active: true
        }]);

      if (error) throw error;

      setSuccess('App connected successfully!');
      await loadApps();
      setActiveTab('connected');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
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
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Link2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Connected Apps</h1>
                <p className="text-[#86868b]">Manage apps linked to your ZPRIA account</p>
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

        {/* SSO Info */}
        <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-indigo-700">Single Sign-On (SSO)</p>
              <p className="text-sm text-indigo-600">
                Your ZPRIA account works across all our products. Sign in once, access everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'connected', label: `Connected (${connectedApps.length})` },
            { id: 'available', label: 'Available Apps' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-white text-[#1d1d1f] hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          {activeTab === 'connected' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Active Connections</h2>
              
              {connectedApps.map((app) => (
                <div key={app.id} className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl">
                        {app.app_icon || '🔗'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1d1d1f]">{app.app_name}</p>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-[#86868b]">{app.app_description}</p>
                        <p className="text-xs text-[#86868b] mt-1">
                          Connected {formatDate(app.connected_at)} • Last used {getTimeAgo(app.last_used)}
                        </p>
                        
                        {/* Permissions */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {app.permissions.map((perm, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.app_url && (
                        <a
                          href={app.app_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-[#0071e3] hover:bg-blue-50 rounded-full transition-colors"
                          title="Open app"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                      <button
                        onClick={() => setShowDisconnectConfirm(app.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Disconnect"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {connectedApps.length === 0 && (
                <div className="text-center py-12 text-[#86868b]">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No connected apps</p>
                  <p className="text-sm mt-1">Connect ZPRIA apps to get started</p>
                  <button
                    onClick={() => setActiveTab('available')}
                    className="mt-4 px-6 py-2 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0051a3] transition-colors"
                  >
                    Browse Apps
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Available ZPRIA Apps</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableApps.map((app) => {
                  const isConnected = connectedApps.some(ca => ca.app_name.includes(app.name));
                  
                  return (
                    <div key={app.id} className="p-4 rounded-2xl border border-gray-200 hover:border-[#0071e3] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                          {app.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-[#1d1d1f]">{app.name}</p>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {app.category}
                            </span>
                          </div>
                          <p className="text-sm text-[#86868b] mt-1">{app.description}</p>
                          
                          {/* Benefits */}
                          <ul className="mt-3 space-y-1">
                            {app.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-[#86868b]">
                                <Check className="w-4 h-4 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => handleConnect(app.id)}
                            disabled={isConnected}
                            className={`mt-4 w-full py-2 rounded-full font-medium transition-colors ${
                              isConnected
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-[#0071e3] text-white hover:bg-[#0051a3]'
                            }`}
                          >
                            {isConnected ? 'Connected' : 'Connect'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700">Security Notice</p>
              <p className="text-sm text-amber-600">
                Only connect apps you trust. Connected apps can access the permissions you grant them. 
                You can revoke access at any time from this page.
              </p>
            </div>
          </div>
        </div>

        {/* Disconnect Modal */}
        {showDisconnectConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-[#1d1d1f]">Disconnect App?</h3>
              </div>
              <p className="text-[#86868b] mb-6">
                This app will no longer have access to your ZPRIA account. You can reconnect anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDisconnect(showDisconnectConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectedAppsPage;
