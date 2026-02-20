
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ChevronLeft, Shield, Database, Share2, Trash2, Download, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface PrivacySettings {
  analytics_consent: boolean;
  marketing_consent: boolean;
  personalization_consent: boolean;
  third_party_sharing: boolean;
  cookie_consent: boolean;
  data_retention_years: number;
  profile_visibility: 'public' | 'friends' | 'private';
  show_email: boolean;
  show_phone: boolean;
  allow_search_by_email: boolean;
  allow_search_by_phone: boolean;
}

const PrivacySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'data' | 'sharing' | 'account'>('data');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [settings, setSettings] = useState<PrivacySettings>({
    analytics_consent: true,
    marketing_consent: false,
    personalization_consent: true,
    third_party_sharing: false,
    cookie_consent: true,
    data_retention_years: 5,
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    allow_search_by_email: false,
    allow_search_by_phone: false
  });

  const [dataStats, setDataStats] = useState({
    profile_completion: 0,
    data_stored_mb: 0,
    last_download: null as string | null
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Fetch privacy settings from user_privacy_settings table
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          analytics_consent: data.analytics_consent !== false,
          marketing_consent: data.marketing_consent === true,
          personalization_consent: data.personalization_consent !== false,
          third_party_sharing: data.third_party_sharing === true,
          cookie_consent: data.cookie_consent !== false,
          data_retention_years: data.data_retention_years || 5,
          profile_visibility: data.profile_visibility || 'public',
          show_email: data.show_email === true,
          show_phone: data.show_phone === true,
          allow_search_by_email: data.allow_search_by_email === true,
          allow_search_by_phone: data.allow_search_by_phone === true
        });
      }

      // Calculate data stats
      await calculateDataStats(userData.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDataStats = async (userId: string) => {
    try {
      // This would typically query multiple tables to calculate stats
      // For now, using placeholder values
      setDataStats({
        profile_completion: 75,
        data_stored_mb: 2.4,
        last_download: null
      });
    } catch (err) {
      console.error('Failed to calculate data stats:', err);
    }
  };

  const handleSettingChange = async (setting: keyof PrivacySettings, value: any) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Update local state immediately for responsive UI
      setSettings(prev => ({ ...prev, [setting]: value }));

      // Upsert to database
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: userData.id,
          [setting]: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSuccess('Privacy setting updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      // Revert local state on error
      setSettings(prev => ({ ...prev, [setting]: !value }));
    }
  };

  const handleDownloadData = async () => {
    try {
      setIsSaving(true);
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Collect all user data
      const userData_export = {
        profile: {},
        settings: settings,
        devices: [],
        activity: [],
        downloads: [],
        purchases: [],
        export_date: new Date().toISOString()
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(userData_export, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zpria-data-export-${userData.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDataStats(prev => ({ ...prev, last_download: new Date().toISOString() }));
      setSuccess('Your data has been downloaded');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      setIsSaving(true);
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Mark account for deletion (soft delete)
      const { error } = await supabase
        .from('users')
        .update({
          account_status: 'pending_deletion',
          deletion_requested_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (error) throw error;

      // Clear local storage and redirect
      localStorage.removeItem('zpria_user');
      localStorage.removeItem('zpria_theme_id');
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const tabs = [
    { id: 'data', label: 'Your Data', icon: Database },
    { id: 'sharing', label: 'Data Sharing', icon: Share2 },
    { id: 'account', label: 'Account Control', icon: Shield }
  ];

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
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Privacy</h1>
                <p className="text-[#86868b]">Control your data and privacy settings</p>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-white text-[#1d1d1f] hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Your Data</h2>
                <p className="text-[#86868b]">Manage how your data is collected and used</p>
              </div>

              {/* Data Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-[#86868b] mb-1">Profile Completion</p>
                  <p className="text-2xl font-semibold text-[#1d1d1f]">{dataStats.profile_completion}%</p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0071e3] transition-all"
                      style={{ width: `${dataStats.profile_completion}%` }}
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-[#86868b] mb-1">Data Stored</p>
                  <p className="text-2xl font-semibold text-[#1d1d1f]">{dataStats.data_stored_mb} MB</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm text-[#86868b] mb-1">Last Download</p>
                  <p className="text-2xl font-semibold text-[#1d1d1f]">
                    {dataStats.last_download ? 'Today' : 'Never'}
                  </p>
                </div>
              </div>

              {/* Data Usage Settings */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[#1d1d1f]">Data Usage</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Analytics & Improvements</p>
                    <p className="text-sm text-[#86868b]">Help us improve by sharing usage data</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('analytics_consent', !settings.analytics_consent)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.analytics_consent ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.analytics_consent ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Personalization</p>
                    <p className="text-sm text-[#86868b]">Get personalized content and recommendations</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('personalization_consent', !settings.personalization_consent)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.personalization_consent ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.personalization_consent ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Marketing Communications</p>
                    <p className="text-sm text-[#86868b]">Receive offers and promotional content</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('marketing_consent', !settings.marketing_consent)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.marketing_consent ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.marketing_consent ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Cookies</p>
                    <p className="text-sm text-[#86868b]">Allow cookies for better experience</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('cookie_consent', !settings.cookie_consent)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.cookie_consent ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.cookie_consent ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Download Data */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[#1d1d1f] mb-4">Download Your Data</h3>
                <p className="text-[#86868b] mb-4">
                  Get a copy of all data associated with your account. This may take a few minutes to prepare.
                </p>
                <button
                  onClick={handleDownloadData}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  {isSaving ? 'Preparing...' : 'Download My Data'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sharing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Data Sharing</h2>
                <p className="text-[#86868b]">Control how your data is shared with others</p>
              </div>

              {/* Profile Visibility */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#1d1d1f]">Profile Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['public', 'friends', 'private'] as const).map((visibility) => (
                    <button
                      key={visibility}
                      onClick={() => handleSettingChange('profile_visibility', visibility)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.profile_visibility === visibility
                          ? 'border-[#0071e3] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        {visibility === 'public' && <Eye className="w-6 h-6 text-[#0071e3]" />}
                        {visibility === 'friends' && <Share2 className="w-6 h-6 text-[#0071e3]" />}
                        {visibility === 'private' && <EyeOff className="w-6 h-6 text-[#0071e3]" />}
                      </div>
                      <p className="font-medium text-[#1d1d1f] capitalize">{visibility}</p>
                      <p className="text-xs text-[#86868b] mt-1">
                        {visibility === 'public' && 'Anyone can see your profile'}
                        {visibility === 'friends' && 'Only connections can see'}
                        {visibility === 'private' && 'Only you can see'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info Visibility */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[#1d1d1f]">Contact Information</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Show Email on Profile</p>
                    <p className="text-sm text-[#86868b]">Allow others to see your email address</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('show_email', !settings.show_email)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.show_email ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.show_email ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Show Phone on Profile</p>
                    <p className="text-sm text-[#86868b]">Allow others to see your phone number</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('show_phone', !settings.show_phone)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.show_phone ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.show_phone ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Search Settings */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-[#1d1d1f]">Search Settings</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Allow Search by Email</p>
                    <p className="text-sm text-[#86868b]">People can find you using your email</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allow_search_by_email', !settings.allow_search_by_email)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.allow_search_by_email ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.allow_search_by_email ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Allow Search by Phone</p>
                    <p className="text-sm text-[#86868b]">People can find you using your phone</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('allow_search_by_phone', !settings.allow_search_by_phone)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.allow_search_by_phone ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.allow_search_by_phone ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Third Party Sharing */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                <div>
                  <p className="font-medium text-red-700">Third-Party Data Sharing</p>
                  <p className="text-sm text-red-600">Share data with trusted partners</p>
                </div>
                <button
                  onClick={() => handleSettingChange('third_party_sharing', !settings.third_party_sharing)}
                  className={`w-14 h-8 rounded-full transition-all ${settings.third_party_sharing ? 'bg-red-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.third_party_sharing ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Account Control</h2>
                <p className="text-[#86868b]">Manage your account status and deletion</p>
              </div>

              {/* Data Retention */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block font-medium text-[#1d1d1f] mb-2">Data Retention Period</label>
                <p className="text-sm text-[#86868b] mb-4">
                  How long we keep your data after account deletion
                </p>
                <select
                  value={settings.data_retention_years}
                  onChange={(e) => handleSettingChange('data_retention_years', parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all bg-white"
                >
                  <option value={1}>1 year</option>
                  <option value={3}>3 years</option>
                  <option value={5}>5 years (default)</option>
                  <option value={7}>7 years</option>
                </select>
              </div>

              {/* Delete Account */}
              <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-700 mb-2">Delete Account</h3>
                    <p className="text-red-600 text-sm mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed after the retention period.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-[#1d1d1f]">Delete Account?</h3>
              </div>
              <p className="text-[#86868b] mb-4">
                This action cannot be undone. Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving || deleteConfirmText !== 'DELETE'}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
