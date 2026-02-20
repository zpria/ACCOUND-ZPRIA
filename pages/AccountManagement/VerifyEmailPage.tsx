
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from '../../constants';
import LoadingOverlay from '../components/LoadingOverlay';
import { supabase } from '../services/supabaseService';
import { sendOTP, sendWelcomeAlert } from '../services/emailService';
import { autoGenerateProfileImage } from '../services/aiImageService';
import { logActivity } from '../services/deviceDetection';
import { UserProfile } from '../types';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend Timer States
  const [countdown, setCountdown] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Identify if we are in recovery mode
  const queryParams = new URLSearchParams(location.search);
  const isResetMode = queryParams.get('mode') === 'reset' || sessionStorage.getItem('zpria_temp_email') !== null;

  useEffect(() => {
    const savedEmail = localStorage.getItem('zpria_verification_email') || sessionStorage.getItem('zpria_temp_email');
    if (!savedEmail) {
      setError('Registration session expired. Please sign up again.');
      return;
    }
    setEmail(savedEmail.toLowerCase());
    // Start countdown immediately when page loads with email
    setShowTimer(true);
    setCountdown(60);
  }, []);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [countdown]);

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

  const startCountdown = () => {
    setShowTimer(true);
    setCountdown(60);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    // Start timer immediately when resend is clicked
    startCountdown();
    
    try {
      const newOtpCode = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // Update DB with new OTP
      await supabase.from('otp_verifications').insert({ 
        email, 
        otp_code: newOtpCode, 
        purpose: isResetMode ? 'password_reset' : 'registration', 
        expires_at: new Date(Date.now() + 600000).toISOString() 
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
        to_name: 'ZPRIA User', 
        to_email: email, 
        otp_code: newOtpCode,
        purpose: isResetMode ? 'Password Reset' : 'Registration',
        device_info: deviceInfo,
        ip_address: ipAddress,
        login_time: loginTime
      });
      
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 8) return;

    setIsLoading(true);
    setError('');
    try {
      const { data: vData } = await supabase.from('otp_verifications')
        .select('*')
        .eq('email', email)
        .eq('otp_code', code)
        .eq('is_used', false)
        .maybeSingle();
        
      if (!vData) throw new Error('Invalid code. Please check and try again.');

      // Mark OTP as used
      await supabase.from('otp_verifications').update({ is_used: true }).eq('id', vData.id);

      if (isResetMode) {
        // Handle Password Reset verification success
        sessionStorage.setItem('zpria_reset_authorized', 'true');
        sessionStorage.setItem('zpria_reset_email', email);
        navigate('/reset-password'); 
      } else {
        // Handle Registration verification success
        const { data: pending } = await supabase.from('pending_registrations').select('*').eq('email', email).maybeSingle();
        if (!pending) throw new Error('Registration session expired. Please sign up again.');

        // Check how many accounts already exist with this mobile number
        const { data: existingUsers } = await supabase
          .from('users')
          .select('id')
          .eq('mobile', pending.mobile);
        
        const existingCount = existingUsers?.length || 0;
        if (existingCount >= 3) {
          throw new Error('This phone number already has 3 accounts. Please use a different number.');
        }

        const { error: insertError } = await supabase.from('users').insert({
          username: pending.username,
          login_id: pending.login_id,
          password_hash: pending.password_hash,
          first_name: pending.first_name,
          last_name: pending.last_name,
          email: pending.email,
          mobile: pending.mobile,
          address: pending.address || 'Dhaka, Bangladesh',
          dob: pending.dob,
          gender: pending.gender,
          is_email_verified: true,
          account_status: 'active'
        });

        if (insertError) {
          // Check if it's a duplicate mobile number error
          if (insertError.message?.includes('users_mobile_key')) {
            throw new Error('This phone number is already registered. Please use a different number.');
          }
          throw insertError;
        }

        // Create user session (auto login)
        const user: UserProfile = {
          // Core Identity
          id: pending.username,
          username: pending.username,
          login_id: pending.login_id,
          firstName: pending.first_name,
          lastName: pending.last_name,
          email: pending.email,
          mobile: pending.mobile,
          address: pending.address || 'Dhaka, Bangladesh',
          dob: pending.dob,
          gender: pending.gender,
          
          // Verification & Status
          isEmailVerified: true,
          isMobileVerified: false,
          accountStatus: 'active',
          
          // Security
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
          
          // Preferences
          themePreference: 'purple',
          preferredLanguage: 'bn',
          language: 'bn',
          currency: 'BDT',
          
          // Notifications
          emailNewsletter: true,
          smsNotification: false,
          whatsappNotification: false,
          pushNotification: true,
          
          // Personal Info
          hasChildren: false,
          
          // Activity Patterns
          isMorningUser: false,
          isNightOwl: false,
          isWeekendShopper: false,
          
          // Interests
          interests: {
            music: false, gaming: false, sports: false, travel: false,
            parenting: false, automotive: false, technology: false,
            environment: false, photography: false, real_estate: false,
            food_cooking: false, ai_automation: false, books_reading: false,
            fashion_style: false, politics_news: false, health_fitness: false,
            education_learning: false, finance_investment: false,
            movies_entertainment: false, business_entrepreneurship: false
          },
          interestScores: {},
          
          // Device Info
          locationPermission: false,
          cameraPermission: false,
          
          // Behavior Data
          behaviorData: {
            ad_history: [], cart_count: 0, share_count: 0,
            bounce_count: 0, cart_abandoned: false, wishlist_count: 0,
            payment_started: false, unused_features: [],
            scroll_depth_avg: 0, checkout_abandoned: false
          },
          
          // Visit Stats
          totalVisitCount: 0,
          totalSessionMinutes: 0,
          avgSessionMinutes: 0,
          visitsPerWeek: 0,
          pagesPerSession: 0,
          daysSinceLastActivity: 0,
          
          // Ad Stats
          adsSeenCount: 0,
          adsClickedCount: 0,
          adCtr: 0,
          
          // E-commerce Status
          hasWishlist: false,
          hasCartItem: false,
          cartAbandoned: false,
          checkoutAbandoned: false,
          paymentStarted: false,
          requestedRefund: false,
          complaintCount: 0,
          doesShare: false,
          doesReview: false,
          
          // Purchase Stats
          totalPurchaseCount: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          maxSingleOrderValue: 0,
          
          // Subscription
          isSubscriber: false,
          usedCoupon: false,
          usedDiscount: false,
          isTrialUser: false,
          hasUpgraded: false,
          hasDowngraded: false,
          isBulkBuyer: false,
          isGiftBuyer: false,
          
          // Referral
          referralCount: 0,
          
          // Social
          isCommunityActive: false,
          isInfluencer: false,
          socialFollowerCount: 0,
          socialFollowingCount: 0,
          helpfulReviewCount: 0,
          
          // User Feedback
          skillLevel: 'beginner',
          teamOrSolo: 'solo',
          useType: 'personal',
          
          // RFM Scores
          rfmRecencyScore: 0,
          rfmFrequencyScore: 0,
          rfmMonetaryScore: 0,
          rfmTotalScore: 0,
          
          // Segmentation
          userSegment: 'L1_COLD',
          funnelLevel: 1,
          funnelStage: 'Awareness',
          segmentUpdatedAt: new Date().toISOString(),
          
          // Risk
          churnRiskScore: 0,
          isAtRisk: false,
          isChurned: false,
          isPriceSensitive: false,
          isPremiumSeeker: false,
          isDealHunter: false,
          isMobileOnly: false,
          isDesktopOnly: false,
          
          // Timestamps
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          
          // Extra Data
          dynamicData: {}
        };
        localStorage.setItem('zpria_user', JSON.stringify(user));

        await sendWelcomeAlert({
          to_name: pending.first_name,
          to_email: pending.email,
          username: pending.username,
          login_id: pending.login_id,
          isNewRegistration: true
        });

        // Get the created user ID for AI image generation
        const { data: createdUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', pending.username)
          .single();

        if (createdUser) {
          // Auto-generate AI profile image
          autoGenerateProfileImage(
            createdUser.id,
            pending.first_name,
            pending.last_name,
            pending.gender,
            pending.dob
          ).then(avatarUrl => {
            if (avatarUrl) {
              console.log('AI Profile image generated:', avatarUrl);
            }
          }).catch(err => {
            console.error('AI image generation failed:', err);
          });

          // Log registration activity
          logActivity(createdUser.id, 'login', {
            method: 'registration',
            is_new_user: true
          });
        }

        await supabase.from('pending_registrations').delete().eq('email', email);
        navigate('/verify-phone');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white reveal-node font-sans">
      <div className="w-full max-w-[520px]">
        <div className="text-center mb-10">
          <ZPRIA_MAIN_LOGO className="w-16 h-16 mx-auto mb-6" />
          
          <h1 className="text-[28px] font-black tracking-tighter text-[#1d1d1f] mb-1 uppercase">
            {isResetMode ? "Forgot password" : "Verify Email"}
          </h1>
          <p className="text-[#1d1d1f] text-[18px] font-bold mb-4">
            {isResetMode ? "Forgot password email verification" : "Verification email"}
          </p>
          
          <p className="text-[#86868b] text-[15px] mb-1">Enter the verification code sent to:</p>
          <p className="font-bold text-[#1d1d1f] text-[16px]">{email || '...'}</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-1.5 mb-10">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="apple-otp-input !w-[44px] !h-[60px] md:!w-[54px] md:!h-[74px]"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-500 text-[14px] rounded-[18px] text-center font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center mb-12">
            {!showTimer ? (
              <button 
                type="button" 
                onClick={startCountdown}
                className="text-[#0066cc] text-[15px] font-bold hover:underline uppercase tracking-tight"
              >
                Didn’t get a code?
              </button>
            ) : (
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                    Resend code after <span className="text-blue-500">{countdown}</span> seconds
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResend}
                    className="text-[#0066cc] text-[15px] font-black uppercase tracking-widest hover:underline"
                  >
                    Resend email
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="apple-btn-secondary flex-1 py-4 uppercase font-black tracking-widest text-sm"
            >
              Go Back
            </button>
            <button 
              type="submit" 
              disabled={isLoading || otp.some(d => !d)} 
              className="apple-btn-primary flex-1 py-4 uppercase font-black tracking-widest text-sm shadow-xl shadow-blue-500/20"
            >
              {isLoading ? "Synchronizing..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
      
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
};

export default VerifyEmailPage;
