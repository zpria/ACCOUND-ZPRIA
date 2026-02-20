import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';
import { Smartphone, Monitor, Globe, LogOut, Shield, AlertCircle, Check } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';

interface Device {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  isTrusted: boolean;
}

const DevicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState('');
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<string | null>(null);
  const [showSignOutAllConfirm, setShowSignOutAllConfirm] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      // Fetch active sessions/devices
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;

      // Format devices data
      const formattedDevices: Device[] = data?.map((session: any, index: number) => ({
        id: session.id,
        deviceName: session.device_name || `Device ${index + 1}`,
        deviceType: session.device_type || 'desktop',
        browser: session.browser || 'Unknown Browser',
        location: session.location || 'Unknown Location',
        lastActive: session.last_used_at,
        isCurrent: session.is_current || index === 0,
        isTrusted: session.is_trusted || false,
      })) || [];

      // Add current device if not in list
      if (formattedDevices.length === 0) {
        formattedDevices.push({
          id: 'current',
          deviceName: 'This Device',
          deviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown',
          location: 'Current Location',
          lastActive: new Date().toISOString(),
          isCurrent: true,
          isTrusted: true,
        });
      }

      setDevices(formattedDevices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutDevice = async (deviceId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.id !== deviceId));
      setShowSignOutConfirm(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOutAll = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all sessions except current
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .neq('is_current', true);

      if (error) throw error;

      setDevices(devices.filter(d => d.isCurrent));
      setShowSignOutAllConfirm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Smartphone;
      default:
        return Monitor;
    }
  };

  const formatLastActive = (dateString: string) => {
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
    return `${diffDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1024px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ZPRIA_MAIN_LOGO className="w-10 h-10" />
            <span className="text-[21px] font-semibold text-[#1d1d1f]">Devices</span>
          </Link>
          <Link 
            to="/security" 
            className="text-[#0071e3] font-medium hover:underline"
          >
            Back to Security
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Page Title */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-[40px] md:text-[48px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
              Active Sessions
            </h1>
            <p className="text-[19px] text-[#86868b] max-w-[500px] mx-auto">
              Manage devices that are currently signed in to your ZPRIA account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Current Device Alert */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200 mb-8">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">You're currently signed in</h3>
                <p className="text-sm text-green-700">
                  This is the device you're using right now
                </p>
              </div>
            </div>
          </div>

          {/* Devices List */}
          <div className="space-y-4 mb-8">
            {devices.map((device) => {
              const Icon = getDeviceIcon(device.deviceType);
              return (
                <div
                  key={device.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${
                    device.isCurrent ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      device.isCurrent ? 'bg-green-100' : 'bg-[#f5f5f7]'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        device.isCurrent ? 'text-green-600' : 'text-[#86868b]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f]">
                          {device.deviceName}
                        </h3>
                        {device.isCurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Current
                          </span>
                        )}
                        {device.isTrusted && !device.isCurrent && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Trusted
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] text-[#86868b] mb-2">
                        {device.browser} • {device.location}
                      </p>
                      <p className="text-[13px] text-gray-400">
                        Last active {formatLastActive(device.lastActive)}
                      </p>
                    </div>
                    {!device.isCurrent && (
                      <button
                        onClick={() => setShowSignOutConfirm(device.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Sign out this device"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sign Out All Button */}
          {devices.length > 1 && (
            <button
              onClick={() => setShowSignOutAllConfirm(true)}
              className="w-full py-4 border-2 border-red-500 text-red-500 rounded-xl font-semibold text-[17px] hover:bg-red-50 transition-colors"
            >
              Sign Out All Other Devices
            </button>
          )}

          {/* Security Note */}
          <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Don't recognize a device?</h4>
                <p className="text-sm text-amber-700">
                  If you see a device you don't recognize, sign it out immediately and change your password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] text-center mb-2">
              Sign Out Device?
            </h2>
            <p className="text-[#86868b] text-center mb-6">
              This will immediately sign out the selected device from your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(null)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-[#1d1d1f] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSignOutDevice(showSignOutConfirm)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out All Confirmation Modal */}
      {showSignOutAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] text-center mb-2">
              Sign Out All Devices?
            </h2>
            <p className="text-[#86868b] text-center mb-6">
              This will sign out all devices except the one you're currently using.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutAllConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-semibold text-[#1d1d1f] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutAll}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
              >
                Sign Out All
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default DevicesPage;
