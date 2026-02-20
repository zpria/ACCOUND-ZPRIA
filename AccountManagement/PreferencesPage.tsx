
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, Globe, Clock, DollarSign, Calendar, Moon, Sun, 
  Monitor, Volume2, Keyboard, Sparkles, ChevronLeft, Check,
  AlertCircle, CheckCircle2, Loader2, Type, Palette, Layout,
  Bell, Eye, Zap, Save, X
} from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface UserPreferences {
  // Language & Region
  language: string;
  timezone: string;
  currency: string;
  
  // Date & Time Format
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY';
  time_format: '12h' | '24h';
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  font_size: 'small' | 'medium' | 'large';
  
  // Behavior
  animations_enabled: boolean;
  sound_enabled: boolean;
  keyboard_shortcuts: boolean;
  auto_save: boolean;
  
  // Features
  beta_features: boolean;
  experimental_ui: boolean;
  analytics_enabled: boolean;
  
  // Notifications
  desktop_notifications: boolean;
  email_digest_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  
  // Privacy
  show_online_status: boolean;
  allow_data_collection: boolean;
  
  // Accessibility
  high_contrast: boolean;
  reduced_motion: boolean;
  screen_reader_optimized: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' }
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'EST (Eastern Standard Time)' },
  { value: 'America/Chicago', label: 'CST (Central Standard Time)' },
  { value: 'America/Denver', label: 'MST (Mountain Standard Time)' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Standard Time)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)' },
  { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)' },
  { value: 'Asia/Kolkata', label: 'IST (Indian Standard Time)' },
  { value: 'Asia/Dhaka', label: 'BST (Bangladesh Standard Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
  { value: 'Asia/Shanghai', label: 'CST (China Standard Time)' },
  { value: 'Australia/Sydney', label: 'AEST (Australian Eastern)' },
  { value: 'Pacific/Auckland', label: 'NZST (New Zealand Standard)' }
];

const CURRENCIES = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' }
];

const DATE_FORMATS: { value: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY'; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: '12/31/2024', example: 'US Format' },
  { value: 'DD/MM/YYYY', label: '31/12/2024', example: 'European Format' },
  { value: 'YYYY-MM-DD', label: '2024-12-31', example: 'ISO Format' },
  { value: 'DD-MM-YYYY', label: '31-12-2024', example: 'International Format' }
];

const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<'general' | 'appearance' | 'behavior' | 'notifications' | 'privacy' | 'accessibility'>('general');
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    timezone: 'UTC',
    currency: 'BDT',
    date_format: 'DD/MM/YYYY',
    time_format: '12h',
    theme: 'system',
    density: 'comfortable',
    font_size: 'medium',
    animations_enabled: true,
    sound_enabled: true,
    keyboard_shortcuts: true,
    auto_save: true,
    beta_features: false,
    experimental_ui: false,
    analytics_enabled: true,
    desktop_notifications: true,
    email_digest_frequency: 'daily',
    show_online_status: true,
    allow_data_collection: true,
    high_contrast: false,
    reduced_motion: false,
    screen_reader_optimized: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    if (originalPreferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
      setHasChanges(changed);
    }
  }, [preferences, originalPreferences]);

  const loadPreferences = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userData.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const loadedPrefs: UserPreferences = {
          language: data.language || 'en',
          timezone: data.timezone || 'UTC',
          currency: data.currency || 'BDT',
          date_format: data.date_format || 'DD/MM/YYYY',
          time_format: data.time_format || '12h',
          theme: data.theme || 'system',
          density: data.density || 'comfortable',
          font_size: data.font_size || 'medium',
          animations_enabled: data.animations_enabled !== false,
          sound_enabled: data.sound_enabled !== false,
          keyboard_shortcuts: data.keyboard_shortcuts !== false,
          auto_save: data.auto_save !== false,
          beta_features: data.beta_features === true,
          experimental_ui: data.experimental_ui === true,
          analytics_enabled: data.analytics_enabled !== false,
          desktop_notifications: data.desktop_notifications !== false,
          email_digest_frequency: data.email_digest_frequency || 'daily',
          show_online_status: data.show_online_status !== false,
          allow_data_collection: data.allow_data_collection !== false,
          high_contrast: data.high_contrast === true,
          reduced_motion: data.reduced_motion === false,
          screen_reader_optimized: data.screen_reader_optimized === true
        };
        setPreferences(loadedPrefs);
        setOriginalPreferences(loadedPrefs);
      } else {
        // Create default preferences
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({ user_id: userData.id });
        
        if (insertError) throw insertError;
        setOriginalPreferences({ ...preferences });
      }
    } catch (err: any) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      const userData = JSON.parse(savedUser);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userData.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setOriginalPreferences({ ...preferences });
      setHasChanges(false);
      setSuccess('Preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const resetPreferences = () => {
    if (originalPreferences) {
      setPreferences({ ...originalPreferences });
      setHasChanges(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'dark': return <Moon className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getDensityIcon = (density: string) => {
    switch (density) {
      case 'compact': return <Layout className="w-5 h-5" />;
      case 'comfortable': return <Eye className="w-5 h-5" />;
      case 'spacious': return <Type className="w-5 h-5" />;
      default: return <Layout className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Loading preferences..." />;
  }

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Sparkles }
  ];

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
                <h1 className="text-[28px] font-semibold text-[#1d1d1f]">Preferences</h1>
                <p className="text-[#86868b] text-sm">Customize your ZPRIA experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={resetPreferences}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={savePreferences}
                disabled={!hasChanges || isSaving}
                className="px-6 py-2 bg-[#6366f1] text-white rounded-xl font-medium hover:bg-[#5558e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
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
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-[#6366f1]/5 text-[#6366f1] border-l-4 border-[#6366f1]'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Section */}
            {activeSection === 'general' && (
              <>
                {/* Language & Region */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1d1d1f]">Language & Region</h2>
                      <p className="text-sm text-[#86868b]">Set your preferred language and regional settings</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreference('language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-white"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Timezone</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => updatePreference('timezone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-white"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-2">Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => updatePreference('currency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-white"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.name} ({curr.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date & Time Format */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1d1d1f]">Date & Time Format</h2>
                      <p className="text-sm text-[#86868b]">Choose how dates and times are displayed</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Date Format */}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-3">Date Format</label>
                      <div className="grid grid-cols-2 gap-3">
                        {DATE_FORMATS.map((format) => (
                          <button
                            key={format.value}
                            onClick={() => updatePreference('date_format', format.value)}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              preferences.date_format === format.value
                                ? 'border-[#6366f1] bg-[#6366f1]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium text-[#1d1d1f]">{format.label}</p>
                            <p className="text-sm text-[#86868b]">{format.example}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Format */}
                    <div>
                      <label className="block text-sm font-medium text-[#1d1d1f] mb-3">Time Format</label>
                      <div className="flex gap-3">
                        {(['12h', '24h'] as const).map((format) => (
                          <button
                            key={format}
                            onClick={() => updatePreference('time_format', format)}
                            className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                              preferences.time_format === format
                                ? 'border-[#6366f1] bg-[#6366f1]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-medium text-[#1d1d1f]">{format === '12h' ? '12-hour' : '24-hour'}</p>
                            <p className="text-sm text-[#86868b]">{format === '12h' ? '2:30 PM' : '14:30'}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <>
                {/* Theme */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1d1d1f]">Theme</h2>
                      <p className="text-sm text-[#86868b]">Choose your preferred color scheme</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updatePreference('theme', theme)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.theme === theme
                            ? 'border-[#6366f1] bg-[#6366f1]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          {getThemeIcon(theme)}
                        </div>
                        <p className="font-medium text-[#1d1d1f] capitalize">{theme}</p>
                        <p className="text-xs text-[#86868b]">
                          {theme === 'system' ? 'Follow system' : `${theme} mode`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Layout className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1d1d1f]">Density</h2>
                      <p className="text-sm text-[#86868b]">Control how compact or spacious the interface feels</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                      <button
                        key={density}
                        onClick={() => updatePreference('density', density)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          preferences.density === density
                            ? 'border-[#6366f1] bg-[#6366f1]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          {getDensityIcon(density)}
                        </div>
                        <p className="font-medium text-[#1d1d1f] capitalize">{density}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Type className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1d1d1f]">Font Size</h2>
                      <p className="text-sm text-[#86868b]">Adjust text size for better readability</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updatePreference('font_size', size)}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          preferences.font_size === size
                            ? 'border-[#6366f1] bg-[#6366f1]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p 
                          className="font-medium text-[#1d1d1f] capitalize"
                          style={{ 
                            fontSize: size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px' 
                          }}
                        >
                          {size}
                        </p>
                        <p className="text-sm text-[#86868b] mt-1">
                          {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Behavior Section */}
            {activeSection === 'behavior' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Behavior</h2>
                    <p className="text-sm text-[#86868b]">Customize how ZPRIA behaves</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Animations */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Animations</p>
                        <p className="text-sm text-[#86868b]">Enable smooth transitions and animations</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.animations_enabled}
                      onChange={(e) => updatePreference('animations_enabled', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Sound */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Sound Effects</p>
                        <p className="text-sm text-[#86868b]">Play sounds for notifications and actions</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.sound_enabled}
                      onChange={(e) => updatePreference('sound_enabled', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Keyboard Shortcuts */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Keyboard className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Keyboard Shortcuts</p>
                        <p className="text-sm text-[#86868b]">Enable keyboard navigation and shortcuts</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.keyboard_shortcuts}
                      onChange={(e) => updatePreference('keyboard_shortcuts', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Auto Save */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Save className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Auto Save</p>
                        <p className="text-sm text-[#86868b]">Automatically save your work</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.auto_save}
                      onChange={(e) => updatePreference('auto_save', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Beta Features */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Beta Features</p>
                        <p className="text-sm text-[#86868b]">Try experimental features before release</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.beta_features}
                      onChange={(e) => updatePreference('beta_features', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Experimental UI */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Experimental UI</p>
                        <p className="text-sm text-[#86868b]">Enable upcoming interface designs</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.experimental_ui}
                      onChange={(e) => updatePreference('experimental_ui', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Notification Preferences</h2>
                    <p className="text-sm text-[#86868b]">Control how you receive notifications</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Desktop Notifications */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Desktop Notifications</p>
                        <p className="text-sm text-[#86868b]">Show notifications on your desktop</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.desktop_notifications}
                      onChange={(e) => updatePreference('desktop_notifications', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Email Digest */}
                  <div>
                    <label className="block text-sm font-medium text-[#1d1d1f] mb-3">Email Digest Frequency</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['immediate', 'daily', 'weekly', 'never'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => updatePreference('email_digest_frequency', freq)}
                          className={`p-4 rounded-xl border-2 transition-all capitalize ${
                            preferences.email_digest_frequency === freq
                              ? 'border-[#6366f1] bg-[#6366f1]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Privacy Settings</h2>
                    <p className="text-sm text-[#86868b]">Control your privacy and data sharing</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Online Status */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Show Online Status</p>
                        <p className="text-sm text-[#86868b]">Let others see when you're online</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.show_online_status}
                      onChange={(e) => updatePreference('show_online_status', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Data Collection */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Allow Data Collection</p>
                        <p className="text-sm text-[#86868b]">Help improve ZPRIA by sharing usage data</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.allow_data_collection}
                      onChange={(e) => updatePreference('allow_data_collection', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Analytics */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Analytics</p>
                        <p className="text-sm text-[#86868b]">Enable analytics for personalized experience</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics_enabled}
                      onChange={(e) => updatePreference('analytics_enabled', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Accessibility Section */}
            {activeSection === 'accessibility' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#1d1d1f]">Accessibility</h2>
                    <p className="text-sm text-[#86868b]">Make ZPRIA work better for you</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* High Contrast */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">High Contrast</p>
                        <p className="text-sm text-[#86868b]">Increase contrast for better visibility</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.high_contrast}
                      onChange={(e) => updatePreference('high_contrast', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Reduced Motion */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Reduced Motion</p>
                        <p className="text-sm text-[#86868b]">Minimize animations and transitions</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.reduced_motion}
                      onChange={(e) => updatePreference('reduced_motion', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>

                  {/* Screen Reader */}
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1d1d1f]">Screen Reader Optimized</p>
                        <p className="text-sm text-[#86868b]">Optimize for screen reader compatibility</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.screen_reader_optimized}
                      onChange={(e) => updatePreference('screen_reader_optimized', e.target.checked)}
                      className="w-6 h-6 text-[#6366f1] rounded focus:ring-[#6366f1]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesPage;
