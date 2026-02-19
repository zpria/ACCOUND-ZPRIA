
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';
import { UserProfile } from '../types';
import FloatingInput from '../components/FloatingInput';
import LoadingOverlay from '../components/LoadingOverlay';
import { hashPassword, handleLoginAttempt, supabase } from '../services/supabaseService';
import { sendWelcomeAlert } from '../services/emailService';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const SigninPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'identifier' | 'password'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const normalizedId = identifier.trim().toLowerCase();
      const { data: user, error: queryError } = await supabase
        .from('users')
        .select('id, first_name, last_name, username, login_id, mobile, email, address, dob, gender, is_email_verified, theme_preference, account_status')
        .or(`username.eq.${normalizedId},login_id.eq.${normalizedId},mobile.eq.${normalizedId},email.eq.${normalizedId}`)
        .maybeSingle();

      if (queryError) throw queryError;
      
      if (!user) {
        throw new Error('ZPRIA Account not found. Please verify your identifier.');
      }

      setFoundUser(user);
      setStep('password');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);
    setError('');
    try {
      const hPassword = await hashPassword(password);
      const user = await handleLoginAttempt(identifier.trim().toLowerCase(), hPassword);
      
      const userProfile: UserProfile = {
        id: user.id,
        username: user.username,
        login_id: user.login_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        dob: user.dob,
        gender: user.gender,
        isEmailVerified: user.is_email_verified,
        themePreference: user.theme_preference,
        accountStatus: user.account_status
      };

      onLogin(userProfile);

      await sendWelcomeAlert({
        to_name: userProfile.firstName,
        to_email: userProfile.email,
        username: userProfile.username,
        login_id: userProfile.login_id,
        isNewRegistration: false
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-4 px-6 reveal-node pb-24">
      <div className="max-w-[1000px] w-full text-center flex flex-col items-center">
        <ZPRIA_MAIN_LOGO className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] mb-4 transition-transform hover:scale-105 duration-500" />
        
        <div className="max-w-[420px] w-full">
          {step === 'identifier' && (
            <div className="flex justify-end mb-2">
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}
          {step === 'password' && (
            <>
              <h1 className="text-[32px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-none mb-2">
                Welcome
              </h1>
              <p className="text-[15px] text-gray-500 font-medium mb-6">
                {foundUser?.first_name} {foundUser?.last_name}
              </p>
            </>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-[#F43F5E] rounded-xl text-sm font-bold border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          {step === 'identifier' ? (
            <form onSubmit={handleContinue} className="w-full space-y-4 reveal-stagger">
              <div className="space-y-4">
                <FloatingInput 
                  label="Username, Login ID, or Mobile" 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)} 
                  autoFocus
                />
              </div>
              
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center text-xs text-gray-400 font-bold cursor-pointer hover:text-gray-600 transition-colors">
                  <input type="checkbox" className="w-3 h-3 mr-2 accent-[#7C3AED]" /> Remember me
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !identifier} 
                className="w-full py-3.5 bg-[#7C3AED] text-white rounded-2xl font-black text-base shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-40"
              >
                {isLoading ? "VERIFYING..." : "CONTINUE"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4 reveal-stagger">
              <div className="relative group space-y-2">
                <FloatingInput 
                  label="Password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  autoFocus
                />
                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                
                <button 
                  type="button"
                  onClick={() => {
                    setStep('identifier');
                    setPassword('');
                    setError('');
                  }}
                  className="text-[11px] font-black text-[#7C3AED] uppercase tracking-widest hover:underline block mx-auto pt-2"
                >
                  Change Account
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !password} 
                className="w-full py-3.5 bg-[#7C3AED] text-white rounded-2xl font-black text-base shadow-xl shadow-purple-500/20 hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-40"
              >
                {isLoading ? "SYNCHRONIZING..." : "SIGN IN"}
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              You do not have an account? <Link to="/signup" className="text-[#7C3AED] ml-1 hover:underline">Create Your Zipra Account</Link>
            </p>
            
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/support" className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868b] hover:text-[#1d1d1f]">Support</Link>
              <span className="w-1 h-1 bg-gray-300 rounded-full my-auto"></span>
              <Link to="/support" className="text-[10px] font-black uppercase tracking-[0.15em] text-[#86868b] hover:text-[#1d1d1f]">Help Center</Link>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100 text-left space-y-6">
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1d1d1f] mb-2">How to Sign In</h3>
              <p className="text-[13px] text-[#86868b] leading-relaxed">
                Enter your unique ZPRIA Username, Login ID, or registered Mobile number to begin. Your ZPRIA Account provides a single, secure identity across the entire creative ecosystem.
              </p>
            </section>
            
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#1d1d1f] mb-2">Privacy & Security</h3>
              <p className="text-[13px] text-[#86868b] leading-relaxed">
                We employ end-to-end encryption and sovereign identity protocols to ensure your data remains yours. By signing in, you agree to our <Link to="/privacy" className="text-[#7C3AED] hover:underline">Privacy Policy</Link> and <Link to="/terms" className="text-[#7C3AED] hover:underline">Terms of Service</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
      
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default SigninPage;
