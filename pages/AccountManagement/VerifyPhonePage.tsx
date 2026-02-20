
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO, COUNTRY_LIST } from '../constants';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';
import { UserProfile } from '../types';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const VerifyPhonePage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const draft = localStorage.getItem('zpria_signup_draft');
    const savedEmail = localStorage.getItem('zpria_verification_email');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Get country code and format full mobile number
        const countryCode = parsed.countryCode || 'BD';
        const mobileNum = parsed.mobile || '';
        
        // Find country dial code
        const country = COUNTRY_LIST.find((c: any) => c.value === countryCode);
        const dialCode = country?.code || '+880';
        
        // Format: +880 1XXX-XXXXXX
        const cleanMobile = mobileNum.startsWith('0') ? mobileNum.slice(1) : mobileNum;
        setMobile(`${dialCode} ${cleanMobile}`);
      } catch (e) {
        setMobile('your phone number');
      }
    }
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const finalizeRegistration = async () => {
    setIsLoading(true);
    try {
      // User is already logged in from email verification
      // Just clean up and go to home (which shows ProductHub for logged in users)
      localStorage.removeItem('zpria_signup_draft');
      localStorage.removeItem('zpria_verification_email');
      navigate('/');
    } catch (err) {
      console.error("Finalization failed", err);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    // If user entered OTP, verify it (optional)
    // If not, just skip to product hub
    if (code.length === 8) {
      // Optional: verify phone OTP here if you implement it later
      console.log('Phone OTP entered:', code);
    }
    
    // Always go to product hub - phone verification is optional
    finalizeRegistration();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white reveal-node">
      <div className="w-full max-w-[483px]">
        <div className="text-center mb-8">
          <ZPRIA_MAIN_LOGO className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-2">Verify Phone Number</h1>
          <p className="text-[#86868b] text-[15px]">Enter the verification code sent to:</p>
          <p className="font-semibold text-[#1d1d1f]">{mobile}</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-1 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="apple-otp-input"
              />
            ))}
          </div>

          <div className="relative mb-12 text-center">
            <button 
              type="button" 
              onClick={() => setShowOptions(!showOptions)}
              className="text-[#0066cc] text-[13px] font-medium hover:underline"
            >
              Didn’t get a code?
            </button>
            {showOptions && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 w-52 animate-in fade-in zoom-in duration-200">
                <button type="button" className="w-full text-left p-3 text-[13px] font-semibold hover:bg-gray-50 rounded-lg">Resend via SMS</button>
                <button type="button" className="w-full text-left p-3 text-[13px] font-semibold hover:bg-gray-50 rounded-lg">Receive Phone Call</button>
                <button type="button" onClick={() => navigate('/signup')} className="w-full text-left p-3 text-[13px] font-semibold hover:bg-gray-50 rounded-lg text-red-500">Change Number</button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={finalizeRegistration} className="apple-btn-secondary flex-1">Skip</button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="apple-btn-primary flex-1"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
      
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default VerifyPhonePage;
