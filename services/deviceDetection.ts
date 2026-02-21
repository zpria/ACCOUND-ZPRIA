
// Device Detection Service - Auto detects device, browser, IP, location
import { dataIds, colors } from '../config';

export interface DeviceInfo {
  device_type: 'mobile' | 'tablet' | 'desktop';
  device_name: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  screen_resolution: string;
  language: string;
  timezone: string;
  ip_address: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
}

// Detect device type
export const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  if (/ipad|tablet|playbook|silk/.test(userAgent) || 
      (screenWidth >= 600 && screenWidth < 1024)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(userAgent) || 
      screenWidth < 600) {
    return 'mobile';
  }
  
  return 'desktop';
};

// Detect browser
export const detectBrowser = (): { name: string; version: string } => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = '';
  
  // Chrome
  if (/chrome|chromium|crios/i.test(userAgent) && !/edg/i.test(userAgent)) {
    name = 'Chrome';
    const match = userAgent.match(/(?:chrome|chromium|crios)\/(\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  // Firefox
  else if (/firefox|fxios/i.test(userAgent)) {
    name = 'Firefox';
    const match = userAgent.match(/(?:firefox|fxios)\/(\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  // Safari
  else if (/safari/i.test(userAgent) && !/chrome|chromium|crios/i.test(userAgent)) {
    name = 'Safari';
    const match = userAgent.match(/version\/(\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  // Edge
  else if (/edg/i.test(userAgent)) {
    name = 'Edge';
    const match = userAgent.match(/edg\/(\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  // Opera
  else if (/opr|opera/i.test(userAgent)) {
    name = 'Opera';
    const match = userAgent.match(/(?:opr|opera)\/(\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  
  return { name, version };
};

// Detect OS
export const detectOS = (): { name: string; version: string } => {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = '';
  
  // Windows
  if (/windows nt/i.test(userAgent)) {
    name = 'Windows';
    if (/windows nt 10/i.test(userAgent)) version = '10/11';
    else if (/windows nt 6.3/i.test(userAgent)) version = '8.1';
    else if (/windows nt 6.2/i.test(userAgent)) version = '8';
    else if (/windows nt 6.1/i.test(userAgent)) version = '7';
  }
  // macOS
  else if (/macintosh|mac os x/i.test(userAgent)) {
    name = 'macOS';
    const match = userAgent.match(/mac os x (\d+[._]\d+)/i);
    version = match ? match[1].replace('_', '.') : '';
  }
  // iOS
  else if (/iphone|ipad|ipod/i.test(userAgent)) {
    name = 'iOS';
    const match = userAgent.match(/os (\d+[._]\d+)/i);
    version = match ? match[1].replace('_', '.') : '';
  }
  // Android
  else if (/android/i.test(userAgent)) {
    name = 'Android';
    const match = userAgent.match(/android (\d+(\.\d+)*)/i);
    version = match ? match[1] : '';
  }
  // Linux
  else if (/linux/i.test(userAgent)) {
    name = 'Linux';
  }
  
  return { name, version };
};

// Generate device name
export const generateDeviceName = (): string => {
  const os = detectOS();
  const deviceType = detectDeviceType();
  
  if (deviceType === 'mobile') {
    return `${os.name} Phone`;
  } else if (deviceType === 'tablet') {
    return `${os.name} Tablet`;
  }
  return `${os.name} PC`;
};

// Get screen resolution
export const getScreenResolution = (): string => {
  return `${window.screen.width}x${window.screen.height}`;
};

// Get IP address
export const getIPAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'Unknown';
  }
};

// Get location from IP
export const getLocationFromIP = async (ip: string): Promise<DeviceInfo['location']> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      country: data.country_name,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch {
    return {};
  }
};

// Get full device info
export const getFullDeviceInfo = async (): Promise<DeviceInfo> => {
  const browser = detectBrowser();
  const os = detectOS();
  const ip = await getIPAddress();
  const location = await getLocationFromIP(ip);
  
  return {
    device_type: detectDeviceType(),
    device_name: generateDeviceName(),
    browser: browser.name,
    browser_version: browser.version,
    os: os.name,
    os_version: os.version,
    screen_resolution: getScreenResolution(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ip_address: ip,
    location
  };
};

// Save device to database
export const saveDeviceToDatabase = async (userId: string, deviceInfo: DeviceInfo) => {
  try {
    const { supabase } = await import('./supabaseService');
    
    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from('user_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('ip_address', deviceInfo.ip_address)
      .maybeSingle();
    
    if (existingDevice) {
      // Update last active
      await supabase
        .from('user_devices')
        .update({
          last_used_at: new Date().toISOString(),
          is_current: true
        })
        .eq('id', existingDevice.id);
      
      localStorage.setItem('zpria_device_id', existingDevice.id);
      return existingDevice.id;
    }
    
    // Insert new device
    const { data, error } = await supabase
      .from('user_devices')
      .insert([{
        user_id: userId,
        device_name: deviceInfo.device_name,
        device_type: deviceInfo.device_type,
        browser: `${deviceInfo.browser} ${deviceInfo.browser_version}`,
        os: `${deviceInfo.os} ${deviceInfo.os_version}`,
        location: deviceInfo.location?.city && deviceInfo.location?.country 
          ? `${deviceInfo.location.city}, ${deviceInfo.location.country}`
          : 'Unknown',
        ip_address: deviceInfo.ip_address,
        screen_resolution: deviceInfo.screen_resolution,
        language: deviceInfo.language,
        timezone: deviceInfo.timezone,
        is_current: true,
        is_trusted: false,
        last_used_at: new Date().toISOString()
      }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    localStorage.setItem('zpria_device_id', data.id);
    return data.id;
  } catch (err) {
    console.error('Failed to save device:', err);
    return null;
  }
};

// Log activity
export const logActivity = async (
  userId: string,
  action: string,
  details?: Record<string, any>
) => {
  try {
    const { supabase } = await import('./supabaseService');
    const deviceInfo = await getFullDeviceInfo();
    
    await supabase.from('user_activity_logs').insert([{
      user_id: userId,
      action,
      details: details || {},
      device_type: deviceInfo.device_type,
      device_name: deviceInfo.device_name,
      browser: `${deviceInfo.browser} ${deviceInfo.browser_version}`,
      os: `${deviceInfo.os} ${deviceInfo.os_version}`,
      ip_address: deviceInfo.ip_address,
      location: deviceInfo.location?.city && deviceInfo.location?.country 
        ? `${deviceInfo.location.city}, ${deviceInfo.location.country}`
        : 'Unknown',
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

export default {
  detectDeviceType,
  detectBrowser,
  detectOS,
  generateDeviceName,
  getScreenResolution,
  getIPAddress,
  getLocationFromIP,
  getFullDeviceInfo,
  saveDeviceToDatabase,
  logActivity
};
