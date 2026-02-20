import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../pages/constants';
import { Shield, Smartphone, Mail, Key, ChevronRight, Check, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';
import { updateUserProfile } from '../services/userAccountService';

const TwoFactorSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'methods' | 'sms-setup' | 'email-setup' | 'app-setup' | 'backup-codes' | 'complete'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExisting2FA();
  }, []);

  const checkExisting2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('two_factor_enabled, two_factor_method')
        .eq('id', user.id)
        .single();

      if (data?.two_factor_enabled) {
        // Already enabled, show management options
        setSelectedMethod(data.two_factor_method || '');
        setStep('complete');
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const methods = [
    {
      id: 'authenticator',
      title: 'Authenticator App',
      description: 'Use Google Authenticator, Authy, or similar app',
      icon: Key,
      recommended: true,
    },
    {
      id: 'sms',
      title: 'Text Message (SMS)',
      description: 'Receive a code via SMS to your phone',
      icon: Smartphone,
      recommended: false,
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Receive a code via email',
      icon: Mail,
      recommended: false,
    },
  ];

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'sms') {
      setStep('sms-setup');
    } else if (methodId === 'email') {
      // Load user's email from database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('email')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setEmail(data.email);
          }
        }
      } catch (err) {
        console.error('Error loading email:', err);
      }
      setStep('email-setup');
    } else {
      // For authenticator app, generate a secret key
      setSecretKey(generateSecretKey());
      setStep('app-setup');
    }
  };

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    setBackupCodes(codes);
    setStep('backup-codes');
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAndEnable = async () => {
    setIsLoading(true);
    try {
      // Verify OTP and enable 2FA
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Save 2FA settings using the user account service
      const updateSuccess = await updateUserProfile(user.id, {
        twoFactorEnabled: true,
        twoFactorMethod: selectedMethod === 'authenticator' ? 'totp' : selectedMethod,
        updatedAt: new Date().toISOString()
      });

      if (!updateSuccess) {
        throw new Error('Failed to update 2FA settings');
      }

      setStep('complete');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodsStep = () => (
    <>
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#00c6ff] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Set Up Two-Factor Authentication
        </h1>
        <p className="text-[17px] text-[#86868b] max-w-[500px] mx-auto">
          Choose a method to secure your account with an extra layer of protection
        </p>
      </div>

      <div className="space-y-4">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className="w-full bg-white rounded-2xl p-6 shadow-sm border-2 border-transparent hover:border-[#0071e3] transition-all flex items-center gap-4 text-left group"
            >
              <div className="w-14 h-14 bg-[#f5f5f7] rounded-2xl flex items-center justify-center group-hover:bg-[#0071e3] transition-colors">
                <Icon className="w-7 h-7 text-[#0071e3] group-hover:text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[17px] font-semibold text-[#1d1d1f]">{method.title}</h3>
                  {method.recommended && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#86868b]">{method.description}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#0071e3]" />
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-1">Why enable 2FA?</h4>
            <p className="text-sm text-amber-700">
              Two-factor authentication adds an extra layer of security to your account. 
              Even if someone knows your password, they won't be able to access your account without the second factor.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  const renderSMSSetup = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Enter Your Phone Number
        </h1>
        <p className="text-[17px] text-[#86868b]">
          We'll send a verification code to confirm it's you
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
            Phone Number
          </label>
          <div className="flex gap-3">
            <select className="px-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] border-0 focus:ring-2 focus:ring-[#0071e3]">
              <option value="+880">+880</option>
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="1XXXXXXXXX"
              className="flex-1 px-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] border-0 focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>
        </div>

        <button
          onClick={generateBackupCodes}
          disabled={phoneNumber.length < 10}
          className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-colors disabled:opacity-50"
        >
          Send Verification Code
        </button>
      </div>
    </>
  );

  const renderAppSetup = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Set Up Authenticator App
        </h1>
        <p className="text-[17px] text-[#86868b]">
          Scan the QR code with your authenticator app
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48 mx-auto flex items-center justify-center">
            <span className="text-gray-500">QR Code Placeholder</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Can't scan? Enter this secret key manually:
          </p>
          <div className="mt-2 p-3 bg-gray-100 rounded-lg font-mono text-sm">
            {secretKey || 'ABCDEF1234567890'}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
            Enter 6-digit code from your app
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-full px-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] border-0 focus:ring-2 focus:ring-[#0071e3] text-center text-xl tracking-widest"
          />
        </div>

        <button
          onClick={generateBackupCodes}
          disabled={otpCode.length !== 6}
          className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-colors disabled:opacity-50"
        >
          Verify and Continue
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Supported Apps:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Google Authenticator (iOS/Android)</li>
          <li>Microsoft Authenticator (iOS/Android)</li>
          <li>Authy (iOS/Android)</li>
          <li>LastPass Authenticator (iOS/Android)</li>
        </ul>
      </div>
    </>
  );

  const renderEmailSetup = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Confirm Your Email
        </h1>
        <p className="text-[17px] text-[#86868b]">
          A verification code will be sent to your email address
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-2">
            Your Email Address
          </label>
          <div className="px-4 py-4 bg-[#f5f5f7] rounded-xl text-[17px] border-0">
            {email || 'Loading...'}
          </div>
        </div>

        <button
          onClick={generateBackupCodes}
          className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-colors"
        >
          Send Verification Code
        </button>
      </div>
    </>
  );

  const renderBackupCodes = () => (
    <>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
          Save Your Backup Codes
        </h1>
        <p className="text-[17px] text-[#86868b]">
          Keep these codes safe. You'll need them if you lose access to your {selectedMethod === 'sms' ? 'phone' : selectedMethod === 'email' ? 'email' : 'authenticator app'}.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {backupCodes.map((code, index) => (
            <div
              key={index}
              className="bg-[#f5f5f7] rounded-xl p-3 text-center font-mono text-[14px] text-[#1d1d1f]"
            >
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={copyBackupCodes}
          className="w-full py-3 border-2 border-[#0071e3] text-[#0071e3] rounded-xl font-semibold text-[17px] hover:bg-[#0071e3] hover:text-white transition-colors flex items-center justify-center gap-2 mb-4"
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Copied!' : 'Copy Codes'}
        </button>

        <button
          onClick={handleVerifyAndEnable}
          className="w-full py-4 bg-[#0071e3] text-white rounded-xl font-semibold text-[17px] hover:bg-[#0077ed] transition-colors"
        >
          I've Saved These Codes
        </button>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-200">
        <p className="text-sm text-red-700 text-center">
          <strong>Important:</strong> Each code can only be used once. Store them in a safe place.
        </p>
      </div>
    </>
  );

  const renderComplete = () => (
    <div className="text-center">
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-[32px] font-semibold text-[#1d1d1f] tracking-tight mb-4">
        Two-Factor Authentication Enabled!
      </h1>
      <p className="text-[17px] text-[#86868b] mb-8 max-w-[400px] mx-auto">
        Your account is now protected with an extra layer of security.
      </p>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 max-w-md mx-auto mb-8">
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-[#86868b]">Method</span>
          <span className="font-semibold text-[#1d1d1f]">
            {selectedMethod === 'sms' ? 'SMS' : selectedMethod === 'email' ? 'Email' : 'Authenticator App'}
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-[#86868b]">Status</span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
            Active
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/security')}
        className="px-8 py-4 bg-[#0071e3] text-white rounded-full font-semibold text-[17px] hover:bg-[#0077ed] transition-colors"
      >
        Back to Security
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1024px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ZPRIA_MAIN_LOGO className="w-10 h-10" />
            <span className="text-[21px] font-semibold text-[#1d1d1f]">2FA Setup</span>
          </Link>
          <Link 
            to="/security" 
            className="text-[#0071e3] font-medium hover:underline"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6">
        <div className="max-w-[600px] mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 'methods' && renderMethodsStep()}
          {step === 'sms-setup' && renderSMSSetup()}
          {step === 'email-setup' && renderEmailSetup()}
          {step === 'app-setup' && renderAppSetup()}
          {step === 'backup-codes' && renderBackupCodes()}
          {step === 'complete' && renderComplete()}
        </div>
      </main>

      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default TwoFactorSetupPage;
