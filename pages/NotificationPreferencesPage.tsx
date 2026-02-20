
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Mail, MessageSquare, Smartphone, ChevronLeft, Check, X, Volume2, Megaphone, Shield, ShoppingBag, Heart, Star, Zap } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface NotificationSettings {
  // Email notifications
  email_marketing: boolean;
  email_product_updates: boolean;
  email_newsletter: boolean;
  email_security_alerts: boolean;
  email_account_activity: boolean;
  email_promotions: boolean;
  email_social: boolean;
  
  // SMS notifications
  sms_security_alerts: boolean;
  sms_otp: boolean;
  sms_marketing: boolean;
  sms_appointments: boolean;
  
  // Push notifications
  push_all: boolean;
  push_messages: boolean;
  push_mentions: boolean;
  push_likes: boolean;
  push_comments: boolean;
  push_follows: boolean;
  push_order_updates: boolean;
  push_promotions: boolean;
  
  // In-app notifications
  inapp_all: boolean;
  inapp_tips: boolean;
  inapp_achievements: boolean;
  inapp_recommendations: boolean;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  
  // Frequency
  email_frequency: 'immediate' | 'daily' | 'weekly';
}

const NotificationPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'sms' | 'push' | 'inapp'>('email');
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email_marketing: false,
    email_product_updates: true,
    email_newsletter: true,
    email_security_alerts: true,
    email_account_activity: true,
    email_promotions: false,
    email_social: true,
    
    sms_security_alerts: true,
    sms_otp: true,
    sms_marketing: false,
    sms_appointments: true,
    
    push_all: true,
    push_messages: true,
    push_mentions: true,
    push_likes: true,
    push_comments: true,
    push_follows: true,
    push_order_updates: true,
    push_promotions: false,
    
    inapp_all: true,
    inapp_tips: true,
    inapp_achievements: true,
    inapp_recommendations: true,
    
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    
    email_frequency: 'immediate'
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          email_marketing: data.email_marketing === true,
          email_product_updates: data.email_product_updates !== false,
          email_newsletter: data.email_newsletter !== false,
          email_security_alerts: data.email_security_alerts !== false,
          email_account_activity: data.email_account_activity !== false,
          email_promotions: data.email_promotions === true,
          email_social: data.email_social !== false,
          
          sms_security_alerts: data.sms_security_alerts !== false,
          sms_otp: data.sms_otp !== false,
          sms_marketing: data.sms_marketing === true,
          sms_appointments: data.sms_appointments !== false,
          
          push_all: data.push_all !== false,
          push_messages: data.push_messages !== false,
          push_mentions: data.push_mentions !== false,
          push_likes: data.push_likes !== false,
          push_comments: data.push_comments !== false,
          push_follows: data.push_follows !== false,
          push_order_updates: data.push_order_updates !== false,
          push_promotions: data.push_promotions === true,
          
          inapp_all: data.inapp_all !== false,
          inapp_tips: data.inapp_tips !== false,
          inapp_achievements: data.inapp_achievements !== false,
          inapp_recommendations: data.inapp_recommendations !== false,
          
          quiet_hours_enabled: data.quiet_hours_enabled === true,
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '08:00',
          
          email_frequency: data.email_frequency || 'immediate'
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (setting: keyof NotificationSettings, value: any) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Update local state immediately
      setSettings(prev => ({ ...prev, [setting]: value }));

      // Upsert to database
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userData.id,
          [setting]: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSuccess('Notification preference updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      // Revert on error
      setSettings(prev => ({ ...prev, [setting]: !value }));
    }
  };

  const handleMasterToggle = async (category: 'push' | 'inapp', value: boolean) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      const updates: Partial<NotificationSettings> = {};
      
      if (category === 'push') {
        updates.push_all = value;
        updates.push_messages = value;
        updates.push_mentions = value;
        updates.push_likes = value;
        updates.push_comments = value;
        updates.push_follows = value;
        updates.push_order_updates = value;
        updates.push_promotions = value;
      } else if (category === 'inapp') {
        updates.inapp_all = value;
        updates.inapp_tips = value;
        updates.inapp_achievements = value;
        updates.inapp_recommendations = value;
      }

      setSettings(prev => ({ ...prev, ...updates }));

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: userData.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSuccess(`${category === 'push' ? 'Push' : 'In-app'} notifications ${value ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const ToggleItem = ({ 
    label, 
    description, 
    checked, 
    onChange, 
    icon: Icon,
    disabled = false
  }: { 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: () => void;
    icon: any;
    disabled?: boolean;
  }) => (
    <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#0071e3]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-[#1d1d1f]">{label}</p>
          <p className="text-sm text-[#86868b]">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`w-14 h-8 rounded-full transition-all ${checked ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
      >
        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const tabs = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'sms', label: 'SMS', icon: Smartphone },
    { id: 'push', label: 'Push', icon: Bell },
    { id: 'inapp', label: 'In-App', icon: Megaphone }
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
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Notifications</h1>
                <p className="text-[#86868b]">Choose what you want to be notified about</p>
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
                onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Email Notifications</h2>
                <p className="text-[#86868b]">Manage emails sent to your inbox</p>
              </div>

              {/* Email Frequency */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block font-medium text-[#1d1d1f] mb-2">Email Digest Frequency</label>
                <p className="text-sm text-[#86868b] mb-4">How often you receive summary emails</p>
                <div className="flex gap-2">
                  {(['immediate', 'daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleSettingChange('email_frequency', freq)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                        settings.email_frequency === freq
                          ? 'bg-[#0071e3] text-white'
                          : 'bg-white border border-gray-200 hover:border-[#0071e3]'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <ToggleItem
                  label="Security Alerts"
                  description="Important security notifications"
                  checked={settings.email_security_alerts}
                  onChange={() => handleSettingChange('email_security_alerts', !settings.email_security_alerts)}
                  icon={Shield}
                />
                <ToggleItem
                  label="Account Activity"
                  description="Logins, password changes, and updates"
                  checked={settings.email_account_activity}
                  onChange={() => handleSettingChange('email_account_activity', !settings.email_account_activity)}
                  icon={Zap}
                />
                <ToggleItem
                  label="Product Updates"
                  description="New features and improvements"
                  checked={settings.email_product_updates}
                  onChange={() => handleSettingChange('email_product_updates', !settings.email_product_updates)}
                  icon={Star}
                />
                <ToggleItem
                  label="Newsletter"
                  description="Weekly updates and tips"
                  checked={settings.email_newsletter}
                  onChange={() => handleSettingChange('email_newsletter', !settings.email_newsletter)}
                  icon={Mail}
                />
                <ToggleItem
                  label="Social Activity"
                  description="Mentions, comments, and follows"
                  checked={settings.email_social}
                  onChange={() => handleSettingChange('email_social', !settings.email_social)}
                  icon={Heart}
                />
                <ToggleItem
                  label="Promotions & Offers"
                  description="Special deals and discounts"
                  checked={settings.email_promotions}
                  onChange={() => handleSettingChange('email_promotions', !settings.email_promotions)}
                  icon={Megaphone}
                />
                <ToggleItem
                  label="Marketing Emails"
                  description="Product recommendations and surveys"
                  checked={settings.email_marketing}
                  onChange={() => handleSettingChange('email_marketing', !settings.email_marketing)}
                  icon={ShoppingBag}
                />
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">SMS Notifications</h2>
                <p className="text-[#86868b]">Text messages sent to your phone</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  SMS notifications are sent to: <strong>+880 ••••••••••</strong>
                </p>
              </div>

              <div className="space-y-3">
                <ToggleItem
                  label="Security Alerts"
                  description="Suspicious activity and security warnings"
                  checked={settings.sms_security_alerts}
                  onChange={() => handleSettingChange('sms_security_alerts', !settings.sms_security_alerts)}
                  icon={Shield}
                />
                <ToggleItem
                  label="Verification Codes"
                  description="OTP and verification SMS"
                  checked={settings.sms_otp}
                  onChange={() => handleSettingChange('sms_otp', !settings.sms_otp)}
                  icon={Zap}
                  disabled={true}
                />
                <ToggleItem
                  label="Appointments & Reminders"
                  description="Meeting and event reminders"
                  checked={settings.sms_appointments}
                  onChange={() => handleSettingChange('sms_appointments', !settings.sms_appointments)}
                  icon={Bell}
                />
                <ToggleItem
                  label="Marketing SMS"
                  description="Promotional offers and updates"
                  checked={settings.sms_marketing}
                  onChange={() => handleSettingChange('sms_marketing', !settings.sms_marketing)}
                  icon={Megaphone}
                />
              </div>
            </div>
          )}

          {activeTab === 'push' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Push Notifications</h2>
                <p className="text-[#86868b]">Notifications on your devices</p>
              </div>

              {/* Master Toggle */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">Enable Push Notifications</p>
                    <p className="text-sm text-[#86868b]">Receive notifications on your devices</p>
                  </div>
                  <button
                    onClick={() => handleMasterToggle('push', !settings.push_all)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.push_all ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.push_all ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-[#1d1d1f]">Quiet Hours</p>
                    <p className="text-sm text-[#86868b]">Pause non-urgent notifications</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('quiet_hours_enabled', !settings.quiet_hours_enabled)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.quiet_hours_enabled ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.quiet_hours_enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                {settings.quiet_hours_enabled && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                      <label className="block text-sm text-[#86868b] mb-1">Start</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_start}
                        onChange={(e) => handleSettingChange('quiet_hours_start', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0071e3] outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-[#86868b] mb-1">End</label>
                      <input
                        type="time"
                        value={settings.quiet_hours_end}
                        onChange={(e) => handleSettingChange('quiet_hours_end', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#0071e3] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <ToggleItem
                  label="Messages"
                  description="New direct messages"
                  checked={settings.push_messages}
                  onChange={() => handleSettingChange('push_messages', !settings.push_messages)}
                  icon={MessageSquare}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="Mentions"
                  description="When someone mentions you"
                  checked={settings.push_mentions}
                  onChange={() => handleSettingChange('push_mentions', !settings.push_mentions)}
                  icon={Zap}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="Likes"
                  description="When someone likes your content"
                  checked={settings.push_likes}
                  onChange={() => handleSettingChange('push_likes', !settings.push_likes)}
                  icon={Heart}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="Comments"
                  description="New comments on your posts"
                  checked={settings.push_comments}
                  onChange={() => handleSettingChange('push_comments', !settings.push_comments)}
                  icon={MessageSquare}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="New Followers"
                  description="When someone follows you"
                  checked={settings.push_follows}
                  onChange={() => handleSettingChange('push_follows', !settings.push_follows)}
                  icon={Star}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="Order Updates"
                  description="Shipping and delivery updates"
                  checked={settings.push_order_updates}
                  onChange={() => handleSettingChange('push_order_updates', !settings.push_order_updates)}
                  icon={ShoppingBag}
                  disabled={!settings.push_all}
                />
                <ToggleItem
                  label="Promotions"
                  description="Special offers and deals"
                  checked={settings.push_promotions}
                  onChange={() => handleSettingChange('push_promotions', !settings.push_promotions)}
                  icon={Megaphone}
                  disabled={!settings.push_all}
                />
              </div>
            </div>
          )}

          {activeTab === 'inapp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">In-App Notifications</h2>
                <p className="text-[#86868b]">Notifications while using the app</p>
              </div>

              {/* Master Toggle */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1d1d1f]">Enable In-App Notifications</p>
                    <p className="text-sm text-[#86868b]">Show notifications while using the app</p>
                  </div>
                  <button
                    onClick={() => handleMasterToggle('inapp', !settings.inapp_all)}
                    className={`w-14 h-8 rounded-full transition-all ${settings.inapp_all ? 'bg-[#0071e3]' : 'bg-gray-300'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.inapp_all ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <ToggleItem
                  label="Tips & Tutorials"
                  description="Helpful tips to get the most out of ZPRIA"
                  checked={settings.inapp_tips}
                  onChange={() => handleSettingChange('inapp_tips', !settings.inapp_tips)}
                  icon={Star}
                  disabled={!settings.inapp_all}
                />
                <ToggleItem
                  label="Achievements"
                  description="Milestones and badges earned"
                  checked={settings.inapp_achievements}
                  onChange={() => handleSettingChange('inapp_achievements', !settings.inapp_achievements)}
                  icon={Zap}
                  disabled={!settings.inapp_all}
                />
                <ToggleItem
                  label="Recommendations"
                  description="Personalized content suggestions"
                  checked={settings.inapp_recommendations}
                  onChange={() => handleSettingChange('inapp_recommendations', !settings.inapp_recommendations)}
                  icon={Heart}
                  disabled={!settings.inapp_all}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
