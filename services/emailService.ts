
import { emailConfig } from '../config';

// EmailJS Configuration
const OTP_SERVICE_ID = emailConfig.emailJS.serviceId.otp;
const WELCOME_SERVICE_ID = emailConfig.emailJS.serviceId.welcome;
const PUBLIC_KEY = emailConfig.emailJS.publicKey;
const PRIVATE_KEY = emailConfig.emailJS.privateKey;

const OTP_TEMPLATE_ID = emailConfig.emailJS.templateId.otp;
const WELCOME_TEMPLATE_ID = emailConfig.emailJS.templateId.welcome;

export interface ZpriaEmailParams {
  to_name: string;
  to_email: string;
  // OTP Fields
  otp_code?: string;
  purpose?: string;
  expires_in?: string;
  // Security Context Fields
  device_info?: string;
  ip_address?: string;
  login_time?: string;
  // Welcome/Alert Fields
  success_title?: string;
  welcome_message?: string;
  action_type?: string;
  username?: string;
  login_id?: string;
  subject?: string;
}

/**
 * Normalizes text to avoid spam detection and ensure professional formatting
 */
const normalizeText = (text: string) => {
  if (!text) return '';
  const trimmed = text.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/**
 * Captures security context for alerts without blocking email dispatch
 */
const getSecurityContext = async () => {
  let ip = 'Unknown IP';
  let location = 'Dhaka, Bangladesh';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      ip = data.ip || ip;
    }
  } catch (e) {
    console.warn("IP capture bypassed for speed.");
  }
  
  const deviceInfo = navigator.userAgent.split(')')[0].split('(')[1] || 'Authorized ZPRIA Node';
  const loginTime = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });

  return { ip, location, deviceInfo, loginTime };
};

/**
 * Optimized ZPRIA Email Dispatcher (Ensures immediate arrival of emails across multiple services)
 */
export const sendZpriaEmail = async (params: ZpriaEmailParams) => {
  if (!params.to_email) {
    console.error("Missing recipient email for ZPRIA dispatch");
    return false;
  }

  const isOTP = !!params.otp_code;
  const templateId = isOTP ? OTP_TEMPLATE_ID : WELCOME_TEMPLATE_ID;
  const serviceId = isOTP ? OTP_SERVICE_ID : WELCOME_SERVICE_ID;
  
  const security = await getSecurityContext();
  const siteUrl = emailConfig.siteUrl;

  // Explicitly mapping variables to match template requirements
  const templateParams = {
    to_name: normalizeText(params.to_name),
    email: params.to_email,
    
    // SPAM PREVENTION & COMPLIANCE
    unsubscribe_url: `${siteUrl}/privacy`,
    physical_address: emailConfig.content.physicalAddress,
    
    // OTP SPECIFIC
    otp_code: params.otp_code || '',
    purpose: params.purpose || 'Identity Verification',
    expires_in: params.expires_in || '10 minutes',
    
    // CONTENT & BRANDING
    success_title: params.success_title || 'Security Update',
    welcome_message: params.welcome_message || '',
    action_type: params.action_type || 'NOTIFICATION',
    username: params.username || '',
    login_id: params.login_id || '',
    
    // SECURITY CONTEXT
    device_info: security.deviceInfo,
    ip_address: security.ip,
    login_time: security.loginTime,
    location: security.location,
    
    // PROFESSIONAL SUBJECTS
    subject: params.subject || (isOTP ? "Your ZPRIA verification code" : "Welcome to ZPRIA")
  };

  try {
    const response = await fetch(emailConfig.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: PUBLIC_KEY,
        accessToken: PRIVATE_KEY,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EmailJS Error (${serviceId}): ${errorText}`);
    }

    return true;
  } catch (err) {
    console.error('Email Dispatch Failure:', err);
    return false;
  }
};

export const sendOTP = async (params: { 
  to_name: string, 
  to_email: string, 
  otp_code: string, 
  purpose?: string,
  device_info: string,
  ip_address: string,
  login_time: string
}) => {
  return sendZpriaEmail({
    to_name: params.to_name,
    to_email: params.to_email,
    otp_code: params.otp_code,
    purpose: params.purpose || 'Registration',
    device_info: params.device_info,
    ip_address: params.ip_address,
    login_time: params.login_time,
    subject: "Your ZPRIA verification code"
  });
};

/**
 * Triggers the immediate Welcome Email upon successful email verification.
 */
export const sendWelcomeAlert = async (params: { 
  to_name: string, 
  to_email: string, 
  username: string, 
  login_id: string,
  isNewRegistration?: boolean 
}) => {
  const isNew = params.isNewRegistration;
  return sendZpriaEmail({
    to_name: params.to_name,
    to_email: params.to_email,
    username: params.username,
    login_id: params.login_id,
    success_title: isNew ? "Registration Successful!" : "Welcome Back!",
    action_type: isNew ? "ACCOUNT CREATED" : "LOGIN DETECTED",
    subject: isNew ? "Welcome to ZPRIA" : "Login detected on your ZPRIA account",
    welcome_message: isNew 
      ? "Welcome to ZPRIA! Your account has been successfully created." 
      : "Welcome back to ZPRIA! Your account was accessed from a new device."
  });
};

/**
 * Security alert for password modifications.
 */
export const sendPasswordChangeAlert = async (params: {
  to_name: string,
  to_email: string,
  username: string,
  login_id: string
}) => {
  return sendZpriaEmail({
    to_name: params.to_name,
    to_email: params.to_email,
    username: params.username,
    login_id: params.login_id,
    success_title: "Password Updated Successfully!",
    action_type: "PASSWORD CHANGED",
    subject: "ZPRIA account password changed",
    welcome_message: "Your ZPRIA account password has been successfully changed. If you didn't make this change, please contact us immediately."
  });
};
