import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Smartphone, Key, History, AlertTriangle, ChevronLeft, Eye, EyeOff, Save, Check, X, Mail, Bell, Smartphone as PhoneIcon, MessageSquare } from 'lucide-react';
import { supabase, hashPassword } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { updateUserProfile } from '../services/userAccountService';
import { dataIds, colors, dbConfig } from '../config';

interface SecuritySettings {
  two_factor_enabled: boolean;
  two_factor_method?: string;
  login_notify_every_login: boolean;
  login_notify_new_device_only: boolean;
  login_notify_via_email: boolean;
  login_notify_via_sms: boolean;
  login_notify_via_push: boolean;
  password_change_notify: boolean;
  email_change_notify: boolean;
  phone_change_notify: boolean;
}

interface LoginHistoryItem {
  id: string;
  device_name: string;
  device_type: string;
  browser: string;
  location: string;
  ip_address: string;
  login_time: string;
  is_current: boolean;
}

const SecuritySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'password' | '2fa' | 'notifications' | 'history'>('password');
  
  const [settings, setSettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    two_factor_method: '',
    login_notify_every_login: true,
    login_notify_new_device_only: false,
    login_notify_via_email: true,
    login_notify_via_sms: false,
    login_notify_via_push: true,
    password_change_notify: true,
    email_change_notify: true,
    phone_change_notify: true
  });

  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    number: false,
    upper: false,
    lower: false,
    special: false
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  useEffect(() => {
    checkPasswordStrength(newPassword);
  }, [newPassword]);

  const loadSecuritySettings = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Fetch security settings using the user account service
      const { data, error } = await supabase
        .from(dbConfig.tables.users)
        .select('two_factor_enabled, two_factor_method, login_notify_every_login, login_notify_new_device_only, login_notify_via_email, login_notify_via_sms, login_notify_via_push, password_change_notify, email_change_notify, phone_change_notify')
        .eq('id', userData.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          two_factor_enabled: data.two_factor_enabled || false,
          two_factor_method: data.two_factor_method || '',
          login_notify_every_login: data.login_notify_every_login !== undefined ? data.login_notify_every_login : true,
          login_notify_new_device_only: data.login_notify_new_device_only !== undefined ? data.login_notify_new_device_only : false,
          login_notify_via_email: data.login_notify_via_email !== undefined ? data.login_notify_via_email : true,
          login_notify_via_sms: data.login_notify_via_sms !== undefined ? data.login_notify_via_sms : false,
          login_notify_via_push: data.login_notify_via_push !== undefined ? data.login_notify_via_push : true,
          password_change_notify: data.password_change_notify !== undefined ? data.password_change_notify : true,
          email_change_notify: data.email_change_notify !== undefined ? data.email_change_notify : true,
          phone_change_notify: data.phone_change_notify !== undefined ? data.phone_change_notify : true
        });
      }

      // Load login history
      await loadLoginHistory(userData.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLoginHistory = async (userId: string) => {
    try {
      // Query user_activity_logs table for login activities
      const { data, error } = await supabase
        .from(dbConfig.tables.user_activity_logs)
        .select('*')
        .eq('user_id', userId)
        .ilike('action', '%login%')  // Filter for login-related actions
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setLoginHistory(data.map((item: any) => ({
          id: item.id,
          device_name: item.device_name || item.device_type || 'Unknown Device',
          device_type: item.device_type || 'desktop',
          browser: item.browser || 'Unknown Browser',
          location: item.location || 'Unknown Location',
          ip_address: item.ip_address || '***.***.***.***',
          login_time: item.created_at,
          is_current: item.session_id === localStorage.getItem('zpria_session_id') // Compare with current session
        })));
      }
    } catch (err) {
      console.error('Failed to load login history:', err);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordChecks(checks);
    const metCount = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(Math.floor((metCount / 5) * 100));
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordStrength < 100) {
      setError('Please meet all password requirements');
      return;
    }

    setIsSaving(true);
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) throw new Error('Not logged in');
      
      const userData = JSON.parse(savedUser);
      const currentHash = await hashPassword(currentPassword);
      const newHash = await hashPassword(newPassword);

      // Verify current password
      const { data: user, error: verifyError } = await supabase
        .from(dbConfig.tables.users)
        .select('password_hash')
        .eq('id', userData.id)
        .single();

      if (verifyError || user.password_hash !== currentHash) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase
        .from(dbConfig.tables.users)
        .update({
          password_hash: newHash,
          last_password_change: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (updateError) throw updateError;

      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingChange = async (setting: keyof SecuritySettings, value: any) => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);

      // Map the setting to the appropriate field in the UserProfile interface
      const updateFields: any = {};
      switch (setting) {
        case 'two_factor_enabled':
          updateFields.twoFactorEnabled = value;
          break;
        case 'two_factor_method':
          updateFields.twoFactorMethod = value;
          break;
        case 'login_notify_every_login':
          updateFields.loginNotifyEveryLogin = value;
          break;
        case 'login_notify_new_device_only':
          updateFields.loginNotifyNewDeviceOnly = value;
          break;
        case 'login_notify_via_email':
          updateFields.loginNotifyViaEmail = value;
          break;
        case 'login_notify_via_sms':
          updateFields.loginNotifyViaSms = value;
          break;
        case 'login_notify_via_push':
          updateFields.loginNotifyViaPush = value;
          break;
        case 'password_change_notify':
          updateFields.passwordChangeNotify = value;
          break;
        case 'email_change_notify':
          updateFields.emailChangeNotify = value;
          break;
        case 'phone_change_notify':
          updateFields.phoneChangeNotify = value;
          break;
        default:
          updateFields[setting] = value;
      }

      const updateSuccess = await updateUserProfile(userData.id, updateFields);

      if (!updateSuccess) {
        throw new Error('Failed to update security settings');
      }

      setSettings(prev => ({ ...prev, [setting]: value }));
      setSuccess('Setting updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const tabs = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: '2fa', label: 'Two-Factor Auth', icon: Smartphone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'history', label: 'Login History', icon: History }
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
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Security</h1>
                <p className="text-[#86868b]">Manage your account security settings</p>
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
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Change Password</h2>
                <p className="text-[#86868b] mb-6">
                  Update your password to keep your account secure
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {newPassword && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#1d1d1f]">Strength: {passwordStrength}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength < 40 ? 'bg-red-500' : 
                          passwordStrength < 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {[
                        { met: passwordChecks.length, text: 'At least 8 characters' },
                        { met: passwordChecks.number, text: 'At least 1 number' },
                        { met: passwordChecks.upper, text: 'At least 1 uppercase' },
                        { met: passwordChecks.lower, text: 'At least 1 lowercase' },
                        { met: passwordChecks.special, text: 'At least 1 special character' }
                      ].map((check, i) => (
                        <div key={i} className={`flex items-center gap-2 ${check.met ? 'text-green-600' : 'text-gray-400'}`}>
                          <div className={`w-2 h-2 rounded-full ${check.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {check.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#86868b] mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none transition-all"
                  placeholder="Confirm new password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handlePasswordChange}
                disabled={isSaving}
                className="w-full md:w-auto px-8 py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === '2fa' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Two-Factor Authentication</h2>
                <p className="text-[#86868b]">Add an extra layer of security to your account</p>
              </div>

              {/* 2FA Status */}
              <div className={`p-6 rounded-2xl ${settings.two_factor_enabled ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.two_factor_enabled ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1d1d1f]">
                        {settings.two_factor_enabled ? 'Two-Factor Authentication is On' : 'Two-Factor Authentication is Off'}
                      </h3>
                      <p className="text-sm text-[#86868b]">
                        {settings.two_factor_enabled 
                          ? `Using ${settings.two_factor_method?.toUpperCase()} for verification`
                          : 'Enable 2FA for enhanced security'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/security/2fa-setup')}
                    className={`px-6 py-3 rounded-full font-medium transition-all ${
                      settings.two_factor_enabled
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-[#0071e3] text-white hover:bg-[#0051a3]'
                    }`}
                  >
                    {settings.two_factor_enabled ? 'Manage' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Login Notifications Settings */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#1d1d1f]">Login Notifications</h3>
                  <button
                    onClick={() => navigate('/security/login-notifications')}
                    className="px-4 py-2 bg-[#0071e3] text-white rounded-full text-sm font-medium hover:bg-[#0051a3] transition-colors"
                  >
                    Setup Notifications
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">Notify on every login</h4>
                        <p className="text-sm text-[#86868b]">Send notification for every sign-in</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.login_notify_every_login}
                        onChange={(e) => handleSettingChange('login_notify_every_login', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">Notify only for new devices</h4>
                        <p className="text-sm text-[#86868b]">Only send notification for unrecognized devices</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.login_notify_new_device_only}
                        onChange={(e) => handleSettingChange('login_notify_new_device_only', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">Email notifications</h4>
                        <p className="text-sm text-[#86868b]">Send security alerts via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.login_notify_via_email}
                        onChange={(e) => handleSettingChange('login_notify_via_email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">SMS notifications</h4>
                        <p className="text-sm text-[#86868b]">Send security alerts via SMS</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.login_notify_via_sms}
                        onChange={(e) => handleSettingChange('login_notify_via_sms', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-[#1d1d1f]">Push notifications</h4>
                        <p className="text-sm text-[#86868b]">Send security alerts via push notification</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.login_notify_via_push}
                        onChange={(e) => handleSettingChange('login_notify_via_push', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Account Notifications</h2>
                <p className="text-[#86868b]">Manage notifications for account changes</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-[#1d1d1f]">Password change notifications</h4>
                      <p className="text-sm text-[#86868b]">Notify when your password is changed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.password_change_notify}
                      onChange={(e) => handleSettingChange('password_change_notify', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-[#1d1d1f]">Email change notifications</h4>
                      <p className="text-sm text-[#86868b]">Notify when your email is changed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_change_notify}
                      onChange={(e) => handleSettingChange('email_change_notify', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="font-medium text-[#1d1d1f]">Phone change notifications</h4>
                      <p className="text-sm text-[#86868b]">Notify when your phone number is changed</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.phone_change_notify}
                      onChange={(e) => handleSettingChange('phone_change_notify', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0071e3]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">Login History</h2>
                <p className="text-[#86868b]">Recent sign-ins to your account</p>
              </div>

              <div className="space-y-4">
                {loginHistory.map((item) => (
                  <div key={item.id} className={`p-4 rounded-xl border ${item.is_current ? 'border-[#0071e3] bg-blue-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_current ? 'bg-[#0071e3]' : 'bg-gray-200'}`}>
                          <History className={`w-5 h-5 ${item.is_current ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[#1d1d1f]">{item.device_name}</p>
                            {item.is_current && (
                              <span className="px-2 py-1 bg-[#0071e3] text-white text-xs rounded-full">Current</span>
                            )}
                          </div>
                          <p className="text-sm text-[#86868b]">{item.browser} • {item.location}</p>
                          <p className="text-sm text-[#86868b]">{formatDate(item.login_time)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#86868b]">IP: {item.ip_address}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {loginHistory.length === 0 && (
                  <div className="text-center py-12 text-[#86868b]">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No login history available</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;