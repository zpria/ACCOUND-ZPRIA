
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';
import { supabase } from '../services/supabaseService';
import { sendOTP } from '../services/emailService';
import FloatingInput from '../components/FloatingInput';
import { UserProfile } from '../types';

type RecoveryStep = 'SEARCH' | 'SELECT' | 'METHOD' | 'DONE';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoveryStep>('SEARCH');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data States
  const [foundAccounts, setFoundAccounts] = useState<UserProfile[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<UserProfile | null>(null);
  const [method, setMethod] = useState<'email' | 'sms' | 'password'>('email');

  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    return `${name[0]}***@*******`;
  };

  const maskMobile = (mobile: string) => {
    if (!mobile) return '';
    return `${mobile.slice(0, 4)}*******${mobile.slice(-2)}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setIsLoading(true);
    setError('');

    try {
      const normalizedId = identifier.trim().toLowerCase();
      // Search for any account matching the identifier across username, email, or mobile
      const { data, error: searchError } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike."${normalizedId}",login_id.ilike."${normalizedId}",username.ilike."${normalizedId}",mobile.eq."${normalizedId}"`);

      if (searchError) throw searchError;
      if (!data || data.length === 0) throw new Error('No ZPRIA Account found with that information.');

      const accounts: UserProfile[] = data.map(u => ({
        id: u.id,
        username: u.username,
        login_id: u.login_id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        mobile: u.mobile,
        address: u.address,
        dob: u.dob,
        gender: u.gender,
        isEmailVerified: u.is_email_verified,
        themePreference: u.theme_preference,
        accountStatus: u.account_status
      }));

      if (accounts.length === 1) {
        setSelectedAccount(accounts[0]);
        setStep('METHOD');
      } else {
        setFoundAccounts(accounts);
        setStep('SELECT');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!selectedAccount || method !== 'email') return;
    
    setIsLoading(true);
    setError('');
    try {
      const otpCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      await supabase.from('otp_verifications').insert({ 
        email: selectedAccount.email, 
        otp_code: otpCode, 
        purpose: 'password_reset', 
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() 
      });
      
      const deviceInfo = navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown Device';
      const ipAddress = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'Unknown IP');
      const loginTime = new Date().toLocaleString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
      });
      
      await sendOTP({ 
        to_name: selectedAccount.firstName, 
        to_email: selectedAccount.email, 
        otp_code: otpCode,
        purpose: 'Password Reset',
        device_info: deviceInfo,
        ip_address: ipAddress,
        login_time: loginTime
      });
      
      sessionStorage.setItem('zpria_temp_email', selectedAccount.email);
      navigate('/verify-email?mode=reset'); // Explicit mode set here
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 px-6 reveal-node pb-48 font-sans">
      <div className="max-w-[500px] w-full bg-white md:p-8 rounded-[32px] md:shadow-sm">
        
        {/* Step: SEARCH */}
        {step === 'SEARCH' && (
          <div className="text-center flex flex-col items-center">
            <ZPRIA_MAIN_LOGO className="w-24 h-24 mb-8" />
            <h1 className="text-[32px] font-black text-[#1d1d1f] tracking-tighter mb-4 uppercase">Find Your Account</h1>
            <p className="text-[17px] text-gray-500 font-medium mb-10 leading-tight">
              Enter your email address, mobile number, or username to search for your ZPRIA ID.
            </p>
            <form onSubmit={handleSearch} className="w-full space-y-6">
              <FloatingInput 
                label="Email, Mobile, or Username" 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
              />
              {error && <p className="text-red-500 text-sm font-bold text-center animate-shake">{error}</p>}
              <button 
                type="submit" 
                disabled={isLoading || !identifier} 
                className="apple-btn-primary w-full py-5 text-lg tracking-widest uppercase"
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
              <Link to="/signin" className="block text-[#0066cc] font-bold text-sm uppercase tracking-widest hover:underline">Cancel</Link>
            </form>
          </div>
        )}

        {/* Step: SELECT (Multiple Accounts Found) */}
        {step === 'SELECT' && (
          <div className="w-full">
            <h1 className="text-[24px] font-bold text-[#1d1d1f] mb-2">Choose your account</h1>
            <p className="text-[15px] text-gray-500 mb-8 font-medium">
              These ZPRIA profiles match the information you entered.
            </p>
            <div className="space-y-3">
              {foundAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccount(acc);
                    setStep('METHOD');
                  }}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-[18px] hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl font-bold group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #f5f5f7 0%, #e5e5ea 100%)' }}>
                      {acc.firstName[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#1d1d1f] text-lg leading-tight">{acc.firstName} {acc.lastName}</p>
                      <p className="text-sm text-gray-400 font-medium">{acc.login_id}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setStep('SEARCH')}
              className="mt-8 w-full py-4 border border-gray-200 rounded-full font-bold text-gray-500 text-sm uppercase tracking-widest hover:bg-gray-50"
            >
              Not seeing your account?
            </button>
          </div>
        )}

        {/* Step: METHOD (Selection of Recovery Options) */}
        {step === 'METHOD' && selectedAccount && (
          <div className="w-full">
            {/* Account Header */}
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-[22px] mb-8">
              <div className="w-16 h-16 rounded-full bg-[#004d40] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {selectedAccount.firstName[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-xl text-[#1d1d1f] leading-tight">{selectedAccount.firstName} {selectedAccount.lastName}</p>
                <p className="text-[13px] text-blue-600 font-medium tracking-tight">ZPRIA Identity</p>
              </div>
            </div>

            <h1 className="text-[20px] font-bold text-[#1d1d1f] mb-6 uppercase tracking-tight">Forgot password</h1>
            <p className="text-[15px] text-gray-500 mb-8 font-medium">How would you like to get the code to reset your password?</p>

            <div className="space-y-4 mb-10">
              {/* Email Option */}
              <label className={`flex items-center justify-between p-5 border rounded-[22px] cursor-pointer transition-all ${method === 'email' ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500' : 'border-gray-200'}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1d1d1f]">Get code via email</span>
                  <span className="text-sm text-gray-500 font-medium">{maskEmail(selectedAccount.email)}</span>
                </div>
                <input type="radio" name="method" checked={method === 'email'} onChange={() => setMethod('email')} className="w-6 h-6 accent-blue-600" />
              </label>

              {/* SMS Option - Visual but Placeholder */}
              <label className={`flex items-center justify-between p-5 border rounded-[22px] cursor-pointer opacity-80 ${method === 'sms' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200'}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1d1d1f]">Get code via SMS</span>
                  <span className="text-sm text-gray-500 font-medium">{maskMobile(selectedAccount.mobile || '')}</span>
                </div>
                <input type="radio" name="method" checked={method === 'sms'} onChange={() => setMethod('sms')} className="w-6 h-6 accent-blue-600" />
              </label>

              {/* Password Option */}
              <label className={`flex items-center justify-between p-5 border rounded-[22px] cursor-pointer ${method === 'password' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200'}`}>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1d1d1f]">Continue with password</span>
                  <span className="text-sm text-gray-500 font-medium">Use your password to continue</span>
                </div>
                <input type="radio" name="method" checked={method === 'password'} onChange={() => setMethod('password')} className="w-6 h-6 accent-blue-600" />
              </label>
            </div>

            <div className="text-center mb-10">
               <button className="text-[#0066cc] font-bold text-sm uppercase tracking-tight hover:underline">No longer have access to these?</button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (method === 'password') navigate('/signin');
                  else if (method === 'email') handleSendOTP();
                  else alert("SMS OTP is currently unavailable. Please use Email verification.");
                }}
                disabled={isLoading}
                className="apple-btn-primary w-full py-4 text-[16px] tracking-widest font-black uppercase"
              >
                {isLoading ? "Synchronizing..." : "Continue"}
              </button>
              <button 
                onClick={() => {
                  setStep('SEARCH');
                  setSelectedAccount(null);
                  setFoundAccounts([]);
                }}
                className="w-full py-4 bg-gray-50 text-gray-500 font-black text-sm uppercase tracking-widest rounded-full hover:bg-gray-100 transition-colors"
              >
                Not you?
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
