import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../pages/constants';
import { Shield, Lock, Smartphone, Key, Eye, History, ChevronRight, AlertCircle } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';
import { dataIds, colors, dbConfig } from '../config';

interface SecurityStatus {
  twoFactorEnabled: boolean;
  trustedDevices: number;
  activeSessions: number;
  lastLogin: string;
  passwordLastChanged: string;
}

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch security settings from users table
      const { data: userData, error: userError } = await supabase
        .from(dbConfig.tables.users)
        .select('two_factor_enabled, last_login, password_changed_at')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') throw userError;

      setSecurityStatus({
        twoFactorEnabled: userData?.two_factor_enabled || false,
        trustedDevices: 0, // Placeholder value - actual count would need separate query
        activeSessions: 1, // Placeholder value - actual count would need separate query
        lastLogin: userData?.last_login || new Date().toISOString(),
        passwordLastChanged: userData?.password_changed_at || new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const securityOptions = [
    {
      id: '2fa',
      title: 'Two-Factor Authentication',
      description: securityStatus?.twoFactorEnabled 
        ? 'Enabled - Your account is protected with 2FA'
        : 'Add an extra layer of security to your account',
      icon: Shield,
      status: securityStatus?.twoFactorEnabled ? 'Enabled' : 'Not enabled',
      statusColor: securityStatus?.twoFactorEnabled ? 'text-green-600' : 'text-orange-500',
      path: '/security/2fa-setup',
    },
    {
      id: 'password',
      title: 'Password',
      description: 'Change your password regularly to keep your account secure',
      icon: Lock,
      status: 'Last changed ' + (securityStatus ? new Date(securityStatus.passwordLastChanged).toLocaleDateString() : 'recently'),
      statusColor: 'text-gray-500',
      path: '/security/change-password',
    },
    {
      id: 'devices',
      title: 'Active Sessions & Devices',
      description: `Currently signed in on ${securityStatus?.activeSessions || 1} device(s)`,
      icon: Smartphone,
      status: `${securityStatus?.activeSessions || 1} active`,
      statusColor: 'text-blue-600',
      path: '/security/devices',
    },
    {
      id: 'trusted',
      title: 'Trusted Devices',
      description: `${securityStatus?.trustedDevices || 0} trusted device(s) saved`,
      icon: Eye,
      status: `${securityStatus?.trustedDevices || 0} saved`,
      statusColor: 'text-gray-500',
      path: '/security/trusted-devices',
    },
    {
      id: 'recovery',
      title: 'Recovery Options',
      description: 'Set up recovery contacts and backup codes',
      icon: Key,
      status: 'Setup required',
      statusColor: 'text-orange-500',
      path: '/security/recovery',
    },
    {
      id: 'login-history',
      title: 'Login History',
      description: 'View recent login activity on your account',
      icon: History,
      status: 'View history',
      statusColor: 'text-blue-600',
      path: '/security/login-history',
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Error Loading Security Settings</h2>
          <p className="text-[#86868b] mb-6">{error}</p>
          <button 
            onClick={fetchSecurityStatus}
            className="px-6 py-3 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0077ed] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1024px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ZPRIA_MAIN_LOGO className="w-10 h-10" />
            <span className="text-[21px] font-semibold text-[#1d1d1f]">Security</span>
          </Link>
          <Link 
            to="/account-services" 
            className="text-[#0071e3] font-medium hover:underline"
          >
            Back to Account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
              Security
            </h1>
            <p className="text-[19px] text-[#86868b] max-w-[500px] mx-auto">
              Manage your account security settings and protect your ZPRIA identity
            </p>
          </div>

          {/* Security Status Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Security Status</h2>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                securityStatus?.twoFactorEnabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {securityStatus?.twoFactorEnabled ? 'Protected' : 'At Risk'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#f5f5f7] rounded-2xl">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {securityStatus?.twoFactorEnabled ? 'ON' : 'OFF'}
                </div>
                <div className="text-xs text-[#86868b] uppercase tracking-wide mt-1">2FA</div>
              </div>
              <div className="text-center p-4 bg-[#f5f5f7] rounded-2xl">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {securityStatus?.trustedDevices || 0}
                </div>
                <div className="text-xs text-[#86868b] uppercase tracking-wide mt-1">Trusted</div>
              </div>
              <div className="text-center p-4 bg-[#f5f5f7] rounded-2xl">
                <div className="text-2xl font-bold text-[#1d1d1f]">
                  {securityStatus?.activeSessions || 1}
                </div>
                <div className="text-xs text-[#86868b] uppercase tracking-wide mt-1">Active</div>
              </div>
              <div className="text-center p-4 bg-[#f5f5f7] rounded-2xl">
                <div className="text-2xl font-bold text-[#1d1d1f]">100%</div>
                <div className="text-xs text-[#86868b] uppercase tracking-wide mt-1">Secure</div>
              </div>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-4">
            {securityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => navigate(option.path)}
                  className="w-full bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center gap-4 text-left group"
                >
                  <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center group-hover:bg-[#0071e3] group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7 text-[#0071e3] group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{option.title}</h3>
                      <span className={`text-sm font-medium ${option.statusColor}`}>
                        {option.status}
                      </span>
                    </div>
                    <p className="text-[14px] text-[#86868b]">{option.description}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Security Tips */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
            <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-4">Security Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <p className="text-[15px] text-[#1d1d1f]">Enable two-factor authentication for extra protection</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <p className="text-[15px] text-[#1d1d1f]">Use a strong, unique password that you don't use elsewhere</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <p className="text-[15px] text-[#1d1d1f]">Review your active sessions regularly and sign out from unused devices</p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default SecurityPage;
