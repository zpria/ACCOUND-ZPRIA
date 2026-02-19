
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../constants';
import FloatingInput from '../components/FloatingInput';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase, hashPassword } from '../services/supabaseService';
import { sendPasswordChangeAlert, sendWelcomeAlert } from '../services/emailService';
import { UserProfile } from '../types';

interface Props {
  onLogin: (user: UserProfile) => void;
}

const ResetPasswordPage: React.FC<Props> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const isAuthorized = sessionStorage.getItem('zpria_reset_authorized');
    const resetEmail = sessionStorage.getItem('zpria_reset_email');
    if (!isAuthorized || !resetEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(resetEmail);
  }, [navigate]);

  const passwordValidation = useMemo(() => {
    const pass = password;
    const checks = {
      length: pass.length >= 8,
      number: /[0-9]/.test(pass),
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
    const metCount = Object.values(checks).filter(Boolean).length;
    return { 
      checks, 
      strength: Math.floor((metCount / 5) * 100),
      isStrong: metCount === 5 
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValidation.isStrong) {
      setError('Please meet all password requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const hPassword = await hashPassword(password);
      
      // Update password in Supabase
      const { data: user, error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hPassword })
        .eq('email', email)
        .select('*')
        .single();

      if (updateError) throw updateError;

      // Send confirmation alerts
      await sendPasswordChangeAlert({
        to_name: user.first_name,
        to_email: user.email,
        username: user.username,
        login_id: user.login_id
      });

      // Prepare user profile for session
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

      // Clean up session storage
      sessionStorage.removeItem('zpria_reset_authorized');
      sessionStorage.removeItem('zpria_reset_email');
      sessionStorage.removeItem('zpria_temp_email');

      // Auto-login the user
      onLogin(userProfile);

      // Trigger secondary welcome (Login Alert)
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
    <div className="flex flex-col items-center pt-12 px-6 reveal-node pb-48 font-sans">
      <div className="max-w-[420px] w-full text-center flex flex-col items-center">
        <ZPRIA_MAIN_LOGO className="w-24 h-24 mb-8" />
        
        <h1 className="text-[38px] font-black text-[#1d1d1f] tracking-tighter uppercase leading-none mb-4">
          Reset Password
        </h1>
        <p className="text-[17px] text-gray-500 font-medium mb-10 leading-tight">
          Create a new secure password for your ZPRIA ID.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-[#F43F5E] rounded-xl text-sm font-bold border border-red-100 animate-pulse w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="relative group space-y-4">
            <FloatingInput 
              label="New Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              autoFocus
            />
            
            {/* Password Strength Component based on User Provided HTML */}
            {isPasswordFocused && (
              <div className="absolute bottom-[calc(100%+12px)] left-0 z-50 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[#f2f2f7]/95 backdrop-blur-xl rounded-[24px] border border-white/60 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] text-left">
                  <div className="password-strength-container space-y-4">
                    <section>
                      <p className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-bold text-[#1d1d1f]">Strength:</span>
                        <span className="text-[12px] font-bold text-[#1d1d1f]">
                          <span className="percentage-container">{passwordValidation.strength}%</span>
                        </span>
                      </p>
                      <div className="password-strength h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`progress-bar h-full transition-all duration-500 ${
                            passwordValidation.strength < 40 ? 'bg-red-500' : 
                            passwordValidation.strength < 80 ? 'bg-orange-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${passwordValidation.strength}%` }}
                        ></div>
                      </div>
                    </section>
                    
                    <section>
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#86868b] mb-3">Password Requirements</p>
                      <ul className="password-requirement space-y-1.5">
                        {[
                          { met: passwordValidation.checks.length, text: "At least 8 characters." },
                          { met: passwordValidation.checks.number, text: "At least 1 number." },
                          { met: passwordValidation.checks.upper, text: "At least 1 uppercase letter." },
                          { met: passwordValidation.checks.lower, text: "At least 1 lowercase letter." },
                          { met: passwordValidation.checks.special, text: "At least one special character" }
                        ].map((req, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <p className={`text-[11px] font-medium ${req.met ? 'text-green-600' : 'text-[#86868b]'}`}>
                              {req.text}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                    
                    <section className="pt-2 border-t border-gray-200">
                      <span className="text-[10px] text-gray-400 font-medium leading-tight block">
                        Avoid using a password that you use with other websites or that might be easy for someone else to guess.
                      </span>
                    </section>
                  </div>
                </div>
              </div>
            )}

            <FloatingInput 
              label="Confirm New Password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !passwordValidation.isStrong || password !== confirmPassword} 
            className="w-full py-4 bg-[#0071e3] text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:opacity-90 transition-all uppercase tracking-widest disabled:opacity-40"
          >
            {isLoading ? "Updating ID..." : "Change Password"}
          </button>
        </form>

        <Link to="/signin" className="mt-12 text-sm text-[#0071e3] font-bold hover:underline uppercase tracking-widest">
          Back to Sign In
        </Link>
      </div>
      
      <LoadingOverlay isLoading={isLoading} message="Updating Password..." />
    </div>
  );
};

export default ResetPasswordPage;
