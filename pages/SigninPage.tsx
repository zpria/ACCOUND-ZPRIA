
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ZPRIA_MAIN_LOGO } from './constants';
import { UserProfile } from '../types';
import FloatingInput from '../components/FloatingInput';
import LoadingOverlay from '../components/LoadingOverlay';
import { hashPassword, handleLoginAttempt, supabase } from '../services/supabaseService';
import { sendWelcomeAlert } from '../services/emailService';
import { getFullDeviceInfo, saveDeviceToDatabase, logActivity } from '../services/deviceDetection';

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
  const isAddingAccount = new URLSearchParams(window.location.search).get('add_account') === 'true';

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const normalizedId = identifier.trim().toLowerCase();
      const { data: user, error: queryError } = await supabase
        .from('users')
        .select('id, first_name, last_name, username, login_id, mobile, email, address, dob, gender, is_email_verified, theme_preference, account_status, avatar_url')
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
      
      // Get device info and save
      const deviceInfo = await getFullDeviceInfo();
      await saveDeviceToDatabase(user.id, deviceInfo);
      
      // Log activity
      await logActivity(user.id, 'login', {
        method: isAddingAccount ? 'account_switch' : 'password',
        device_type: deviceInfo.device_type
      });
      
      const userProfile: UserProfile = {
        // Core Identity
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
        
        // Verification & Status
        isEmailVerified: user.is_email_verified,
        isMobileVerified: user.is_mobile_verified ?? false,
        accountStatus: user.account_status,
        
        // Security
        failedLoginAttempts: user.failed_login_attempts ?? 0,
        lastFailedLogin: user.last_failed_login,
        lockedUntil: user.locked_until,
        twoFactorEnabled: user.two_factor_enabled ?? false,
        
        // Preferences
        themePreference: user.theme_preference ?? 'purple',
        preferredFontSize: user.preferred_font_size,
        preferredLayout: user.preferred_layout,
        preferredContentType: user.preferred_content_type,
        preferredLanguage: user.preferred_language ?? 'bn',
        preferredPaymentMethod: user.preferred_payment_method,
        preferredNotificationTime: user.preferred_notification_time,
        preferredCategory: user.preferred_category,
        
        // Profile Media
        avatarUrl: user.avatar_url,
        avatarBase64: user.avatar_base64,
        coverPhotoUrl: user.cover_photo_url,
        bio: user.bio,
        
        // Personal Info
        maritalStatus: user.marital_status,
        hasChildren: user.has_children ?? false,
        education: user.education,
        occupation: user.occupation,
        companyName: user.company_name,
        industry: user.industry,
        monthlyIncomeRange: user.monthly_income_range,
        religion: user.religion,
        lifestyle: user.lifestyle,
        
        // Location
        country: user.country,
        city: user.city,
        area: user.area,
        postalCode: user.postal_code,
        timezone: user.timezone,
        language: user.language ?? 'bn',
        currency: user.currency ?? 'BDT',
        
        // Notifications
        emailNewsletter: user.email_newsletter ?? true,
        smsNotification: user.sms_notification ?? false,
        whatsappNotification: user.whatsapp_notification ?? false,
        pushNotification: user.push_notification ?? true,
        
        // Activity Patterns
        mostActiveDay: user.most_active_day,
        purchaseDayPreference: user.purchase_day_preference,
        mostActiveHour: user.most_active_hour,
        isMorningUser: user.is_morning_user ?? false,
        isNightOwl: user.is_night_owl ?? false,
        isWeekendShopper: user.is_weekend_shopper ?? false,
        
        // Interests
        interests: user.interests ?? {
          music: false, gaming: false, sports: false, travel: false,
          parenting: false, automotive: false, technology: false,
          environment: false, photography: false, real_estate: false,
          food_cooking: false, ai_automation: false, books_reading: false,
          fashion_style: false, politics_news: false, health_fitness: false,
          education_learning: false, finance_investment: false,
          movies_entertainment: false, business_entrepreneurship: false
        },
        interestScores: user.interest_scores ?? {},
        
        // Device Info
        deviceType: user.device_type,
        os: user.os,
        browser: user.browser,
        screenSize: user.screen_size,
        connectionType: user.connection_type,
        appVersion: user.app_version,
        locationPermission: user.location_permission ?? false,
        cameraPermission: user.camera_permission ?? false,
        deviceFingerprint: user.device_fingerprint,
        timezoneOffset: user.timezone_offset,
        
        // Behavior Data
        behaviorData: user.behavior_data ?? {
          ad_history: [], cart_count: 0, share_count: 0,
          bounce_count: 0, cart_abandoned: false, wishlist_count: 0,
          payment_started: false, unused_features: [],
          scroll_depth_avg: 0, checkout_abandoned: false
        },
        
        // Visit Stats
        firstVisitAt: user.first_visit_at,
        totalVisitCount: user.total_visit_count ?? 0,
        totalSessionMinutes: user.total_session_minutes ?? 0,
        avgSessionMinutes: user.avg_session_minutes ?? 0,
        visitsPerWeek: user.visits_per_week ?? 0,
        pagesPerSession: user.pages_per_session ?? 0,
        daysSinceLastActivity: user.days_since_last_activity ?? 0,
        
        // Ad Stats
        adsSeenCount: user.ads_seen_count ?? 0,
        adsClickedCount: user.ads_clicked_count ?? 0,
        adCtr: user.ad_ctr ?? 0,
        
        // E-commerce Status
        hasWishlist: user.has_wishlist ?? false,
        hasCartItem: user.has_cart_item ?? false,
        cartAbandoned: user.cart_abandoned ?? false,
        checkoutAbandoned: user.checkout_abandoned ?? false,
        paymentStarted: user.payment_started ?? false,
        requestedRefund: user.requested_refund ?? false,
        complaintCount: user.complaint_count ?? 0,
        doesShare: user.does_share ?? false,
        doesReview: user.does_review ?? false,
        
        // Purchase Stats
        purchaseHourPreference: user.purchase_hour_preference,
        totalPurchaseCount: user.total_purchase_count ?? 0,
        totalSpent: user.total_spent ?? 0,
        averageOrderValue: user.average_order_value ?? 0,
        maxSingleOrderValue: user.max_single_order_value ?? 0,
        firstPurchaseDate: user.first_purchase_date,
        lastPurchaseDate: user.last_purchase_date,
        topPurchaseCategory: user.top_purchase_category,
        topPurchaseProduct: user.top_purchase_product,
        
        // Subscription
        isSubscriber: user.is_subscriber ?? false,
        subscriptionPlan: user.subscription_plan,
        usedCoupon: user.used_coupon ?? false,
        usedDiscount: user.used_discount ?? false,
        isTrialUser: user.is_trial_user ?? false,
        hasUpgraded: user.has_upgraded ?? false,
        hasDowngraded: user.has_downgraded ?? false,
        isBulkBuyer: user.is_bulk_buyer ?? false,
        isGiftBuyer: user.is_gift_buyer ?? false,
        
        // Referral
        referralSource: user.referral_source,
        referredBy: user.referred_by,
        referralCount: user.referral_count ?? 0,
        
        // Social
        isCommunityActive: user.is_community_active ?? false,
        isInfluencer: user.is_influencer ?? false,
        socialFollowerCount: user.social_follower_count ?? 0,
        socialFollowingCount: user.social_following_count ?? 0,
        helpfulReviewCount: user.helpful_review_count ?? 0,
        
        // User Feedback
        useCase: user.use_case,
        painPoint: user.pain_point,
        skillLevel: user.skill_level ?? 'beginner',
        teamOrSolo: user.team_or_solo ?? 'solo',
        useType: user.use_type ?? 'personal',
        previousCompetitor: user.previous_competitor,
        switchReason: user.switch_reason,
        favoriteFeature: user.favorite_feature,
        dislikedFeature: user.disliked_feature,
        futureGoals: user.future_goals,
        
        // RFM Scores
        rfmRecencyScore: user.rfm_recency_score ?? 0,
        rfmFrequencyScore: user.rfm_frequency_score ?? 0,
        rfmMonetaryScore: user.rfm_monetary_score ?? 0,
        rfmTotalScore: user.rfm_total_score ?? 0,
        
        // Segmentation
        userSegment: user.user_segment ?? 'L1_COLD',
        funnelLevel: user.funnel_level ?? 1,
        funnelStage: user.funnel_stage ?? 'Awareness',
        segmentUpdatedAt: user.segment_updated_at ?? new Date().toISOString(),
        
        // Risk
        churnRiskScore: user.churn_risk_score ?? 0,
        isAtRisk: user.is_at_risk ?? false,
        isChurned: user.is_churned ?? false,
        isPriceSensitive: user.is_price_sensitive ?? false,
        isPremiumSeeker: user.is_premium_seeker ?? false,
        isDealHunter: user.is_deal_hunter ?? false,
        isMobileOnly: user.is_mobile_only ?? false,
        isDesktopOnly: user.is_desktop_only ?? false,
        
        // Timestamps
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        
        // Extra Data
        extraData: user.extra_data,
        dynamicData: user.dynamic_data ?? {},
        authUserId: user.auth_user_id
      };

      // Handle multi-account
      const savedAccounts = localStorage.getItem('zpria_accounts');
      let accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
      
      // Check if account already exists
      const existingIndex = accounts.findIndex((acc: any) => acc.id === user.id);
      const accountData = {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        theme_preference: user.theme_preference || 'purple',
        is_active: true
      };
      
      if (existingIndex >= 0) {
        accounts[existingIndex] = accountData;
      } else {
        // Mark all other accounts as inactive
        accounts = accounts.map((acc: any) => ({ ...acc, is_active: false }));
        accounts.push(accountData);
      }
      
      localStorage.setItem('zpria_accounts', JSON.stringify(accounts));
      localStorage.setItem('zpria_user', JSON.stringify(userProfile));

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
