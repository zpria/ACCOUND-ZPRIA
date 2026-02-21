import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Smartphone, MessageSquare, ChevronLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseService';
import LoadingOverlay from '../components/LoadingOverlay';
import { dataIds, colors, dbConfig } from '../config';

const LoginNotificationSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | 'whatsapp' | ''>('');
  const [otpCode, setOtpCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Load user data on mount
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUser = localStorage.getItem('zpria_user');
        if (!savedUser) {
          navigate('/signin');
          return;
        }
        
        const userData = JSON.parse(savedUser);
        const { data, error } = await supabase
          .from(dbConfig.tables.users)
          .select('email, mobile')
          .eq('id', userData.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setUserEmail(data.email || '');
          setUserPhone(data.mobile || '');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user information');
      }
    };
    
    loadUserData();
  }, [navigate]);

  const handleMethodSelect = async (method: 'email' | 'sms' | 'whatsapp') => {
    setSelectedMethod(method);
    setIsLoading(true);
    setError('');
    
    try {
      // Send OTP based on selected method
      await sendOtp(method);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (method: string) => {
    // Simulate sending OTP - in real implementation, you'd integrate with SMS/Email services
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, we'll just show a success message
    setSuccess(`Verification code sent via ${method === 'email' ? 'email' : method === 'sms' ? 'SMS' : 'WhatsApp'}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, verify the OTP with your backend
      if (otpCode !== '123456') { // Demo code
        throw new Error('Invalid verification code');
      }
      
      // Enable login notifications for the selected method
      const savedUser = localStorage.getItem('zpria_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        
        const updateFields: any = {};
        if (selectedMethod === 'email') {
          updateFields.login_notify_via_email = true;
        } else if (selectedMethod === 'sms') {
          updateFields.login_notify_via_sms = true;
        } else if (selectedMethod === 'whatsapp') {
          // Note: WhatsApp notifications would require additional setup
          updateFields.login_notify_via_sms = true; // Using SMS as fallback
        }
        updateFields.login_notify_every_login = true;
        updateFields.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from(dbConfig.tables.users)
          .update(updateFields)
          .eq('id', userData.id);
        
        if (updateError) throw updateError;
      }
      
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSetupStep = () => (
    <>
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Login Notifications Setup
        </h1>
        <p className="text-[17px] text-[#86868b] max-w-[500px] mx-auto">
          Choose how you'd like to receive notifications when someone logs into your account
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleMethodSelect('email')}
          disabled={!userEmail}
          className={`w-full bg-white rounded-2xl p-6 shadow-sm border-2 transition-all flex items-center gap-4 text-left group ${
            userEmail 
              ? 'border-transparent hover:border-[#0071e3]' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center group-hover:bg-[#0071e3] transition-colors">
            <Mail className="w-7 h-7 text-[#0071e3] group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">Email</h3>
            <p className="text-[14px] text-[#86868b]">
              {userEmail || 'No email address found'}
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3]" />
        </button>

        <button
          onClick={() => handleMethodSelect('sms')}
          disabled={!userPhone}
          className={`w-full bg-white rounded-2xl p-6 shadow-sm border-2 transition-all flex items-center gap-4 text-left group ${
            userPhone 
              ? 'border-transparent hover:border-[#0071e3]' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center group-hover:bg-[#0071e3] transition-colors">
            <Smartphone className="w-7 h-7 text-[#0071e3] group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">SMS</h3>
            <p className="text-[14px] text-[#86868b]">
              {userPhone || 'No phone number found'}
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3]" />
        </button>

        <button
          onClick={() => handleMethodSelect('whatsapp')}
          disabled={!userPhone}
          className={`w-full bg-white rounded-2xl p-6 shadow-sm border-2 transition-all flex items-center gap-4 text-left group ${
            userPhone 
              ? 'border-transparent hover:border-[#0071e3]' 
              : 'border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center group-hover:bg-[#0071e3] transition-colors">
            <MessageSquare className="w-7 h-7 text-[#0071e3] group-hover:text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f]">WhatsApp</h3>
            <p className="text-[14px] text-[#86868b]">
              {userPhone ? `Send to ${userPhone}` : 'No phone number found'}
            </p>
          </div>
          <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3]" />
        </button>
      </div>

      <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Why enable login notifications?</h4>
            <p className="text-sm text-amber-700">
              Get notified whenever someone accesses your account. This helps you detect unauthorized access immediately.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Verify Your Identity
        </h1>
        <p className="text-[17px] text-[#86868b] max-w-[500px] mx-auto">
          Enter the 6-digit code sent to your {selectedMethod}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="123456"
            className="w-full px-4 py-4 text-center text-[24px] tracking-widest rounded-xl border-2 border-gray-200 focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/20 outline-none"
            maxLength={6}
          />
        </div>

        <button
          onClick={handleVerifyOtp}
          disabled={otpCode.length !== 6 || isLoading}
          className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify and Enable'}
        </button>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setStep('setup');
              setSelectedMethod('');
              setOtpCode('');
            }}
            className="text-[#0071e3] font-medium hover:underline"
          >
            Choose a different method
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-[#86868b]">
        <p>Didn't receive the code?</p>
        <button 
          onClick={() => sendOtp(selectedMethod)}
          className="text-[#0071e3] font-medium hover:underline mt-1"
        >
          Resend code
        </button>
      </div>
    </>
  );

  const renderCompleteStep = () => (
    <>
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Login Notifications Enabled!
        </h1>
        <p className="text-[17px] text-[#86868b] max-w-[500px] mx-auto mb-8">
          You'll now receive notifications via {selectedMethod} whenever someone accesses your account.
        </p>
        
        <button
          onClick={() => navigate('/security-settings')}
          className="px-8 py-4 bg-[#0071e3] text-white rounded-full font-semibold hover:bg-[#0051a3] transition-all"
        >
          Back to Security Settings
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] py-8 px-4">
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <button 
            onClick={() => navigate('/security-settings')}
            className="flex items-center gap-2 text-[#0071e3] font-medium mb-4 hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Security Settings
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {step === 'setup' && renderSetupStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'complete' && renderCompleteStep()}
        </div>
      </div>
      
      {isLoading && <LoadingOverlay isLoading={true} message="Processing..." />}
    </div>
  );
};

export default LoginNotificationSetupPage;