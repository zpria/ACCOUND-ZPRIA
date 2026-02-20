
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Tablet, Globe, ChevronLeft, LogOut, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';

interface Device {
  id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
  is_trusted: boolean;
  login_time: string;
}

const DeviceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<string | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) {
        navigate('/signin');
        return;
      }

      const userData = JSON.parse(savedUser);
      
      // Fetch devices from user_devices table
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userData.id)
        .order('last_used_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Get current device info
        const currentDeviceId = localStorage.getItem('zpria_device_id');
        
        setDevices(data.map((device: any) => ({
          id: device.id,
          device_name: device.device_name || generateDeviceDisplayName(device),
          device_type: device.device_type || 'desktop',
          browser: device.browser || 'Unknown Browser',
          os: device.os || 'Unknown OS',
          location: device.location || 'Unknown Location',
          ip_address: device.ip_address || '***.***.***.***',
          last_active: device.last_used_at,
          is_current: device.id === currentDeviceId || device.is_current,
          is_trusted: device.is_trusted || false,
          login_time: device.created_at
        })));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeviceDisplayName = (device: any): string => {
    if (device.os && device.device_type) {
      if (device.device_type === 'mobile') {
        return `${device.os} Phone`;
      } else if (device.device_type === 'tablet') {
        return `${device.os} Tablet`;
      } else {
        return `${device.os} Computer`;
      }
    } else if (device.browser) {
      return `${device.browser} on ${device.device_type}`;
    }
    return 'Unknown Device';
  };

  const handleLogoutDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.id !== deviceId));
      setSuccess('Device logged out successfully');
      setShowLogoutConfirm(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      const savedUser = localStorage.getItem('zpria_user');
      if (!savedUser) return;
      
      const userData = JSON.parse(savedUser);
      const currentDeviceId = localStorage.getItem('zpria_device_id');

      // Delete all devices except current
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', userData.id)
        .neq('id', currentDeviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.is_current));
      setSuccess('All other devices logged out successfully');
      setShowLogoutAllConfirm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleTrust = async (deviceId: string, currentTrust: boolean) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_trusted: !currentTrust })
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.map(d => 
        d.id === deviceId ? { ...d, is_trusted: !currentTrust } : d
      ));
      
      setSuccess(currentTrust ? 'Device removed from trusted list' : 'Device marked as trusted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-6 h-6" />;
      case 'tablet':
        return <Tablet className="w-6 h-6" />;
      case 'desktop':
      default:
        return <Laptop className="w-6 h-6" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
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
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  const currentDevice = devices.find(d => d.is_current);
  const otherDevices = devices.filter(d => !d.is_current);

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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[32px] font-semibold text-[#1d1d1f]">Devices</h1>
                <p className="text-[#86868b]">Manage devices signed in to your account</p>
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

        {/* Current Device */}
        {currentDevice && (
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0071e3] rounded-xl flex items-center justify-center text-white">
                {getDeviceIcon(currentDevice.device_type)}
              </div>
              <div>
                <h2 className="font-semibold text-[#1d1d1f]">Current Device</h2>
                <p className="text-sm text-[#86868b]">You're signed in here now</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0071e3] rounded-xl flex items-center justify-center text-white">
                    {getDeviceIcon(currentDevice.device_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1d1d1f]">{currentDevice.device_name}</p>
                      <span className="px-2 py-1 bg-[#0071e3] text-white text-xs rounded-full">Current</span>
                      {currentDevice.is_trusted && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Trusted
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#86868b]">{currentDevice.browser} • {currentDevice.os}</p>
                    <p className="text-sm text-[#86868b]">{currentDevice.location} • IP: {currentDevice.ip_address}</p>
                    <p className="text-sm text-[#86868b]">Active {formatDate(currentDevice.last_active)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Devices */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-[#1d1d1f] text-lg">Other Devices</h2>
              <p className="text-sm text-[#86868b]">{otherDevices.length} other device{otherDevices.length !== 1 ? 's' : ''} signed in</p>
            </div>
            {otherDevices.length > 0 && (
              <button
                onClick={() => setShowLogoutAllConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Logout All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {otherDevices.map((device) => (
              <div key={device.id} className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1d1d1f]">{device.device_name}</p>
                        {device.is_trusted && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Trusted
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#86868b]">{device.browser} • {device.os}</p>
                      <p className="text-sm text-[#86868b]">{device.location} • IP: {device.ip_address}</p>
                      <p className="text-sm text-[#86868b]">Last active {formatDate(device.last_active)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleTrust(device.id, device.is_trusted)}
                      className={`p-2 rounded-full transition-colors ${
                        device.is_trusted 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={device.is_trusted ? 'Remove from trusted' : 'Mark as trusted'}
                    >
                      <Shield className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowLogoutConfirm(device.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      title="Logout this device"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {otherDevices.length === 0 && (
              <div className="text-center py-12 text-[#86868b]">
                <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No other devices signed in</p>
                <p className="text-sm mt-1">You're only signed in on this device</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1d1d1f] mb-2">Security Tips</h3>
              <ul className="space-y-2 text-sm text-[#86868b]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Log out of devices you don't recognize
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Mark your personal devices as trusted
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Enable two-factor authentication for extra security
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logout Confirm Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-[#1d1d1f]">Logout Device?</h3>
              </div>
              <p className="text-[#86868b] mb-6">
                This will immediately sign out the selected device from your account. The user on that device will need to sign in again.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(null)}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleLogoutDevice(showLogoutConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logout All Confirm Modal */}
        {showLogoutAllConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-[#1d1d1f]">Logout All Devices?</h3>
              </div>
              <p className="text-[#86868b] mb-6">
                This will sign out all other devices from your account. Only this current device will remain signed in.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutAllConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#1d1d1f] rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutAllDevices}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Logout All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagementPage;
