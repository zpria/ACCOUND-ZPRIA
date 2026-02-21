
// Complete User Account Management Service
// Handles all user-related database operations

import { supabase } from './supabaseService';
import { TABLES } from '../config';
import type {
  UserProfile,
  UserAddress,
  UserPaymentMethod,
  UserDevice,
  UserSession,
  UserConnectedApp,
  UserNotificationSetting,
  UserPrivacySetting,
  UserActivityLog,
  UserWallet,
  UserWalletTransaction,
  UserSubscription,
  UserPurchase,
  UserWishlist,
  UserCart,
  UserSocialAccount,
  UserBadge,
  UserMilestone,
  UserStreak,
  UserNote,
  UserSupportTicket,
  UserNotification,
  UserTwoFA,
  UserPasskey,
  UserOnboarding,
  UserAuditLog,
  UserBackupCode,
  UserAccountRecovery,
  UserSecurityQuestion,
  UserTrustedDevice,
  UserSessionPreference,
  UserAccountHistory,
  LoginHistory
} from '../types';

// ==================== USER PROFILE ====================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from(TABLES.users)
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserProfile(data);
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<boolean> => {
  const dbUpdates = mapUserProfileToDatabase(updates);
  console.log('Updating user profile with:', dbUpdates);
  const { error } = await supabase
    .from(TABLES.users)
    .update(dbUpdates)
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user profile:', error);
    return false;
  }

  return true;
};

// ==================== USER ADDRESSES ====================

export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_addresses)
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error || !data) return [];
  return data.map(mapDatabaseToUserAddress);
};

export const addUserAddress = async (address: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserAddress | null> => {
  const dbAddress = mapUserAddressToDatabase(address);
  const { data, error } = await supabase
    .from(TABLES.user_addresses)
    .insert([dbAddress])
    .select()
    .single();

  if (error || !data) return null;
  return mapDatabaseToUserAddress(data);
};

export const updateUserAddress = async (addressId: string, updates: Partial<UserAddress>): Promise<boolean> => {
  const dbUpdates = mapUserAddressToDatabase(updates);
  const { error } = await supabase
    .from(TABLES.user_addresses)
    .update(dbUpdates)
    .eq('id', addressId);

  return !error;
};

export const deleteUserAddress = async (addressId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_addresses)
    .delete()
    .eq('id', addressId);

  return !error;
};

// ==================== PAYMENT METHODS ====================

export const getUserPaymentMethods = async (userId: string): Promise<UserPaymentMethod[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_payment_methods)
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserPaymentMethod);
};

export const addPaymentMethod = async (method: Omit<UserPaymentMethod, 'id' | 'createdAt'>): Promise<UserPaymentMethod | null> => {
  const dbMethod = mapUserPaymentMethodToDatabase(method);
  const { data, error } = await supabase
    .from(TABLES.user_payment_methods)
    .insert([dbMethod])
    .select()
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserPaymentMethod(data);
};

export const setDefaultPaymentMethod = async (userId: string, methodId: string): Promise<boolean> => {
  // First, unset all defaults
  await supabase
    .from(TABLES.user_payment_methods)
    .update({ is_default: false })
    .eq('user_id', userId);
  
  // Set new default
  const { error } = await supabase
    .from(TABLES.user_payment_methods)
    .update({ is_default: true })
    .eq('id', methodId);
  
  return !error;
};

// ==================== USER DEVICES ====================

export const getUserDevices = async (userId: string): Promise<UserDevice[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_devices)
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserDevice);
};

export const trustDevice = async (deviceId: string, trusted: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_devices)
    .update({ is_trusted: trusted })
    .eq('id', deviceId);
  
  return !error;
};

export const removeDevice = async (deviceId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_devices)
    .delete()
    .eq('id', deviceId);
  
  return !error;
};

// ==================== USER SESSIONS ====================

export const getUserSessions = async (userId: string): Promise<UserSession[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_sessions)
    .select('*')
    .eq('user_id', userId)
    .order('last_activity', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSession);
};

export const revokeSession = async (sessionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_sessions)
    .delete()
    .eq('id', sessionId);
  
  return !error;
};

export const revokeAllOtherSessions = async (userId: string, currentSessionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_sessions)
    .delete()
    .eq('user_id', userId)
    .neq('id', currentSessionId);
  
  return !error;
};

// ==================== CONNECTED APPS ====================

export const getConnectedApps = async (userId: string): Promise<UserConnectedApp[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_connected_apps)
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserConnectedApp);
};

export const disconnectApp = async (appId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_connected_apps)
    .delete()
    .eq('id', appId);
  
  return !error;
};

// ==================== NOTIFICATION SETTINGS ====================

export const getNotificationSettings = async (userId: string): Promise<UserNotificationSetting[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_notification_settings)
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserNotificationSetting);
};

export const updateNotificationSetting = async (
  settingId: string,
  updates: Partial<UserNotificationSetting>
): Promise<boolean> => {
  const dbUpdates = mapUserNotificationSettingToDatabase(updates);
  const { error } = await supabase
    .from(TABLES.user_notification_settings)
    .update(dbUpdates)
    .eq('id', settingId);
  
  return !error;
};

// ==================== PRIVACY SETTINGS ====================

export const getPrivacySettings = async (userId: string): Promise<UserPrivacySetting | null> => {
  const { data, error } = await supabase
    .from(TABLES.user_privacy_settings)
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserPrivacySetting(data);
};

export const updatePrivacySettings = async (
  userId: string,
  updates: Partial<UserPrivacySetting>
): Promise<boolean> => {
  const dbUpdates = mapUserPrivacySettingToDatabase(updates);
  const { error } = await supabase
    .from(TABLES.user_privacy_settings)
    .update(dbUpdates)
    .eq('user_id', userId);
  
  return !error;
};

// ==================== ACTIVITY LOGS ====================

export const getActivityLogs = async (userId: string, limit: number = 100): Promise<UserActivityLog[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_activity_logs)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserActivityLog);
};

// ==================== WALLET ====================

export const getUserWallet = async (userId: string): Promise<UserWallet | null> => {
  const { data, error } = await supabase
    .from(TABLES.user_wallets)
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserWallet(data);
};

export const getWalletTransactions = async (walletId: string, limit: number = 50): Promise<UserWalletTransaction[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_wallet_transactions)
    .select('*')
    .eq('wallet_id', walletId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserWalletTransaction);
};

// ==================== SUBSCRIPTIONS ====================

export const getUserSubscriptions = async (userId: string): Promise<UserSubscription[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_subscriptions)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSubscription);
};

// ==================== PURCHASES ====================

export const getUserPurchases = async (userId: string, limit: number = 50): Promise<UserPurchase[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_purchases)
    .select('*')
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserPurchase);
};

// ==================== WISHLIST ====================

export const getUserWishlist = async (userId: string): Promise<UserWishlist[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_wishlists)
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserWishlist);
};

export const addToWishlist = async (item: Omit<UserWishlist, 'id' | 'addedAt'>): Promise<UserWishlist | null> => {
  const dbItem = mapUserWishlistToDatabase(item);
  const { data, error } = await supabase
    .from(TABLES.user_wishlists)
    .insert([dbItem])
    .select()
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserWishlist(data);
};

export const removeFromWishlist = async (wishlistId: string): Promise<boolean> => {
  const { error } = await supabase
    .from(TABLES.user_wishlists)
    .delete()
    .eq('id', wishlistId);
  
  return !error;
};

// ==================== CART ====================

export const getUserCart = async (userId: string): Promise<UserCart[]> => {
  const { data, error } = await supabase
    .from(TABLES.user_carts)
    .select('*')
    .eq('user_id', userId)
    .eq('saved_for_later', false)
    .order('added_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserCart);
};

export const addToCart = async (item: Omit<UserCart, 'id' | 'addedAt' | 'updatedAt'>): Promise<UserCart | null> => {
  const dbItem = mapUserCartToDatabase(item);
  const { data, error } = await supabase
    .from('user_carts')
    .insert([dbItem])
    .select()
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserCart(data);
};

export const updateCartItem = async (cartId: string, updates: Partial<UserCart>): Promise<boolean> => {
  const dbUpdates = mapUserCartToDatabase(updates);
  const { error } = await supabase
    .from('user_carts')
    .update(dbUpdates)
    .eq('id', cartId);
  
  return !error;
};

export const removeFromCart = async (cartId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_carts')
    .delete()
    .eq('id', cartId);
  
  return !error;
};

// ==================== SOCIAL ACCOUNTS ====================

export const getUserSocialAccounts = async (userId: string): Promise<UserSocialAccount[]> => {
  const { data, error } = await supabase
    .from('user_social_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('linked_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSocialAccount);
};

export const disconnectSocialAccount = async (accountId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_social_accounts')
    .delete()
    .eq('id', accountId);
  
  return !error;
};

// ==================== BADGES ====================

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data, error } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserBadge);
};

// ==================== MILESTONES ====================

export const getUserMilestones = async (userId: string): Promise<UserMilestone[]> => {
  const { data, error } = await supabase
    .from('user_milestones')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserMilestone);
};

// ==================== STREAKS ====================

export const getUserStreak = async (userId: string): Promise<UserStreak | null> => {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserStreak(data);
};

// ==================== NOTES ====================

export const getUserNotes = async (userId: string): Promise<UserNote[]> => {
  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_trashed', false)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserNote);
};

export const createNote = async (note: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserNote | null> => {
  const dbNote = mapUserNoteToDatabase(note);
  const { data, error } = await supabase
    .from('user_notes')
    .insert([dbNote])
    .select()
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserNote(data);
};

export const updateNote = async (noteId: string, updates: Partial<UserNote>): Promise<boolean> => {
  const dbUpdates = mapUserNoteToDatabase(updates);
  const { error } = await supabase
    .from('user_notes')
    .update(dbUpdates)
    .eq('id', noteId);
  
  return !error;
};

export const deleteNote = async (noteId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_notes')
    .delete()
    .eq('id', noteId);
  
  return !error;
};

// ==================== SUPPORT TICKETS ====================

export const getUserSupportTickets = async (userId: string): Promise<UserSupportTicket[]> => {
  const { data, error } = await supabase
    .from('user_support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSupportTicket);
};

export const createSupportTicket = async (
  ticket: Omit<UserSupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<UserSupportTicket | null> => {
  const dbTicket = {
    ...mapUserSupportTicketToDatabase(ticket),
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('user_support_tickets')
    .insert([dbTicket])
    .select()
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserSupportTicket(data);
};

// ==================== NOTIFICATIONS ====================

export const getUserNotifications = async (userId: string, limit: number = 50): Promise<UserNotification[]> => {
  const { data, error } = await supabase
    .from('user_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserNotification);
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_notifications')
    .update({ is_opened: true, opened_at: new Date().toISOString() })
    .eq('id', notificationId);
  
  return !error;
};

// ==================== 2FA ====================

export const getUser2FA = async (userId: string): Promise<UserTwoFA | null> => {
  const { data, error } = await supabase
    .from('user_2fa')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserTwoFA(data);
};

// ==================== PASSKEYS ====================

export const getUserPasskeys = async (userId: string): Promise<UserPasskey[]> => {
  const { data, error } = await supabase
    .from('user_passkeys')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false });
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserPasskey);
};

// ==================== ONBOARDING ====================

export const getUserOnboarding = async (userId: string): Promise<UserOnboarding | null> => {
  const { data, error } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  return mapDatabaseToUserOnboarding(data);
};

export const updateOnboardingStep = async (
  userId: string,
  step: keyof UserOnboarding,
  completed: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_onboarding')
    .update({ [step]: completed, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  
  return !error;
};

// ==================== DATA MAPPERS ====================

function mapDatabaseToUserProfile(data: any): UserProfile {
  return {
    id: data.id,
    username: data.username,
    login_id: data.login_id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    mobile: data.mobile,
    address: data.address,
    dob: data.dob,
    gender: data.gender,
    isEmailVerified: data.is_email_verified,
    isMobileVerified: data.is_mobile_verified,
    accountStatus: data.account_status,
    failedLoginAttempts: data.failed_login_attempts,
    lastFailedLogin: data.last_failed_login,
    lockedUntil: data.locked_until,
    twoFactorEnabled: data.two_factor_enabled,
    twoFactorMethod: data.two_factor_method,
    loginNotifyEveryLogin: data.login_notify_every_login,
    loginNotifyNewDeviceOnly: data.login_notify_new_device_only,
    loginNotifyViaEmail: data.login_notify_via_email,
    loginNotifyViaSms: data.login_notify_via_sms,
    loginNotifyViaPush: data.login_notify_via_push,
    passwordChangeNotify: data.password_change_notify,
    emailChangeNotify: data.email_change_notify,
    phoneChangeNotify: data.phone_change_notify,
    themePreference: data.theme_preference,
    preferredFontSize: data.preferred_font_size,
    preferredLayout: data.preferred_layout,
    preferredContentType: data.preferred_content_type,
    preferredLanguage: data.preferred_language,
    preferredPaymentMethod: data.preferred_payment_method,
    preferredNotificationTime: data.preferred_notification_time,
    preferredCategory: data.preferred_category,
    avatarUrl: data.avatar_url,
    avatarBase64: data.avatar_base64,
    coverPhotoUrl: data.cover_photo_url,
    bio: data.bio,
    maritalStatus: data.marital_status,
    hasChildren: data.has_children,
    education: data.education,
    occupation: data.occupation,
    companyName: data.company_name,
    industry: data.industry,
    monthlyIncomeRange: data.monthly_income_range,
    religion: data.religion,
    lifestyle: data.lifestyle,
    country: data.country,
    city: data.city,
    area: data.area,
    postalCode: data.postal_code,
    timezone: data.timezone,
    language: data.language,
    currency: data.currency,
    emailNewsletter: data.email_newsletter,
    smsNotification: data.sms_notification,
    whatsappNotification: data.whatsapp_notification,
    pushNotification: data.push_notification,
    mostActiveDay: data.most_active_day,
    purchaseDayPreference: data.purchase_day_preference,
    mostActiveHour: data.most_active_hour,
    isMorningUser: data.is_morning_user,
    isNightOwl: data.is_night_owl,
    isWeekendShopper: data.is_weekend_shopper,
    interests: data.interests,
    interestScores: data.interest_scores,
    deviceType: data.device_type,
    os: data.os,
    browser: data.browser,
    screenSize: data.screen_size,
    connectionType: data.connection_type,
    appVersion: data.app_version,
    locationPermission: data.location_permission,
    cameraPermission: data.camera_permission,
    deviceFingerprint: data.device_fingerprint,
    timezoneOffset: data.timezone_offset,
    behaviorData: data.behavior_data,
    firstVisitAt: data.first_visit_at,
    totalVisitCount: data.total_visit_count,
    totalSessionMinutes: data.total_session_minutes,
    avgSessionMinutes: data.avg_session_minutes,
    visitsPerWeek: data.visits_per_week,
    pagesPerSession: data.pages_per_session,
    daysSinceLastActivity: data.days_since_last_activity,
    adsSeenCount: data.ads_seen_count,
    adsClickedCount: data.ads_clicked_count,
    adCtr: data.ad_ctr,
    hasWishlist: data.has_wishlist,
    hasCartItem: data.has_cart_item,
    cartAbandoned: data.cart_abandoned,
    checkoutAbandoned: data.checkout_abandoned,
    paymentStarted: data.payment_started,
    requestedRefund: data.requested_refund,
    complaintCount: data.complaint_count,
    doesShare: data.does_share,
    doesReview: data.does_review,
    purchaseHourPreference: data.purchase_hour_preference,
    totalPurchaseCount: data.total_purchase_count,
    totalSpent: data.total_spent,
    averageOrderValue: data.average_order_value,
    maxSingleOrderValue: data.max_single_order_value,
    firstPurchaseDate: data.first_purchase_date,
    lastPurchaseDate: data.last_purchase_date,
    topPurchaseCategory: data.top_purchase_category,
    topPurchaseProduct: data.top_purchase_product,
    isSubscriber: data.is_subscriber,
    subscriptionPlan: data.subscription_plan,
    usedCoupon: data.used_coupon,
    usedDiscount: data.used_discount,
    isTrialUser: data.is_trial_user,
    hasUpgraded: data.has_upgraded,
    hasDowngraded: data.has_downgraded,
    isBulkBuyer: data.is_bulk_buyer,
    isGiftBuyer: data.is_gift_buyer,
    referralSource: data.referral_source,
    referredBy: data.referred_by,
    referralCount: data.referral_count,
    isCommunityActive: data.is_community_active,
    isInfluencer: data.is_influencer,
    socialFollowerCount: data.social_follower_count,
    socialFollowingCount: data.social_following_count,
    helpfulReviewCount: data.helpful_review_count,
    useCase: data.use_case,
    painPoint: data.pain_point,
    skillLevel: data.skill_level,
    teamOrSolo: data.team_or_solo,
    useType: data.use_type,
    previousCompetitor: data.previous_competitor,
    switchReason: data.switch_reason,
    favoriteFeature: data.favorite_feature,
    dislikedFeature: data.disliked_feature,
    futureGoals: data.future_goals,
    rfmRecencyScore: data.rfm_recency_score,
    rfmFrequencyScore: data.rfm_frequency_score,
    rfmMonetaryScore: data.rfm_monetary_score,
    rfmTotalScore: data.rfm_total_score,
    userSegment: data.user_segment,
    funnelLevel: data.funnel_level,
    funnelStage: data.funnel_stage,
    segmentUpdatedAt: data.segment_updated_at,
    churnRiskScore: data.churn_risk_score,
    isAtRisk: data.is_at_risk,
    isChurned: data.is_churned,
    isPriceSensitive: data.is_price_sensitive,
    isPremiumSeeker: data.is_premium_seeker,
    isDealHunter: data.is_deal_hunter,
    isMobileOnly: data.is_mobile_only,
    isDesktopOnly: data.is_desktop_only,
    lastLogin: data.last_login,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    extraData: data.extra_data,
    dynamicData: data.dynamic_data,
    authUserId: data.auth_user_id
  };
}

function mapUserProfileToDatabase(profile: Partial<UserProfile>): any {
  const mapping: Record<string, string> = {
    firstName: 'first_name',
    lastName: 'last_name',
    isEmailVerified: 'is_email_verified',
    isMobileVerified: 'is_mobile_verified',
    accountStatus: 'account_status',
    failedLoginAttempts: 'failed_login_attempts',
    lastFailedLogin: 'last_failed_login',
    lockedUntil: 'locked_until',
    twoFactorEnabled: 'two_factor_enabled',
    twoFactorMethod: 'two_factor_method',
    loginNotifyEveryLogin: 'login_notify_every_login',
    loginNotifyNewDeviceOnly: 'login_notify_new_device_only',
    loginNotifyViaEmail: 'login_notify_via_email',
    loginNotifyViaSms: 'login_notify_via_sms',
    loginNotifyViaPush: 'login_notify_via_push',
    passwordChangeNotify: 'password_change_notify',
    emailChangeNotify: 'email_change_notify',
    phoneChangeNotify: 'phone_change_notify',
    themePreference: 'theme_preference',
    preferredFontSize: 'preferred_font_size',
    preferredLayout: 'preferred_layout',
    preferredContentType: 'preferred_content_type',
    preferredLanguage: 'preferred_language',
    preferredPaymentMethod: 'preferred_payment_method',
    preferredNotificationTime: 'preferred_notification_time',
    preferredCategory: 'preferred_category',
    avatarUrl: 'avatar_url',
    avatarBase64: 'avatar_base64',
    coverPhotoUrl: 'cover_photo_url',
    bio: 'bio',
    maritalStatus: 'marital_status',
    hasChildren: 'has_children',
    education: 'education',
    occupation: 'occupation',
    companyName: 'company_name',
    industry: 'industry',
    monthlyIncomeRange: 'monthly_income_range',
    religion: 'religion',
    lifestyle: 'lifestyle',
    country: 'country',
    city: 'city',
    area: 'area',
    postalCode: 'postal_code',
    timezone: 'timezone',
    language: 'language',
    currency: 'currency',
    emailNewsletter: 'email_newsletter',
    smsNotification: 'sms_notification',
    whatsappNotification: 'whatsapp_notification',
    pushNotification: 'push_notification',
    mostActiveDay: 'most_active_day',
    purchaseDayPreference: 'purchase_day_preference',
    mostActiveHour: 'most_active_hour',
    isMorningUser: 'is_morning_user',
    isNightOwl: 'is_night_owl',
    isWeekendShopper: 'is_weekend_shopper',
    interests: 'interests',
    interestScores: 'interest_scores',
    deviceType: 'device_type',
    os: 'os',
    browser: 'browser',
    screenSize: 'screen_size',
    connectionType: 'connection_type',
    appVersion: 'app_version',
    locationPermission: 'location_permission',
    cameraPermission: 'camera_permission',
    deviceFingerprint: 'device_fingerprint',
    timezoneOffset: 'timezone_offset',
    behaviorData: 'behavior_data',
    firstVisitAt: 'first_visit_at',
    totalVisitCount: 'total_visit_count',
    totalSessionMinutes: 'total_session_minutes',
    avgSessionMinutes: 'avg_session_minutes',
    visitsPerWeek: 'visits_per_week',
    pagesPerSession: 'pages_per_session',
    daysSinceLastActivity: 'days_since_last_activity',
    adsSeenCount: 'ads_seen_count',
    adsClickedCount: 'ads_clicked_count',
    adCtr: 'ad_ctr',
    hasWishlist: 'has_wishlist',
    hasCartItem: 'has_cart_item',
    cartAbandoned: 'cart_abandoned',
    checkoutAbandoned: 'checkout_abandoned',
    paymentStarted: 'payment_started',
    requestedRefund: 'requested_refund',
    complaintCount: 'complaint_count',
    doesShare: 'does_share',
    doesReview: 'does_review',
    purchaseHourPreference: 'purchase_hour_preference',
    totalPurchaseCount: 'total_purchase_count',
    totalSpent: 'total_spent',
    averageOrderValue: 'average_order_value',
    maxSingleOrderValue: 'max_single_order_value',
    firstPurchaseDate: 'first_purchase_date',
    lastPurchaseDate: 'last_purchase_date',
    topPurchaseCategory: 'top_purchase_category',
    topPurchaseProduct: 'top_purchase_product',
    isSubscriber: 'is_subscriber',
    subscriptionPlan: 'subscription_plan',
    usedCoupon: 'used_coupon',
    usedDiscount: 'used_discount',
    isTrialUser: 'is_trial_user',
    hasUpgraded: 'has_upgraded',
    hasDowngraded: 'has_downgraded',
    isBulkBuyer: 'is_bulk_buyer',
    isGiftBuyer: 'is_gift_buyer',
    referralSource: 'referral_source',
    referredBy: 'referred_by',
    referralCount: 'referral_count',
    isCommunityActive: 'is_community_active',
    isInfluencer: 'is_influencer',
    socialFollowerCount: 'social_follower_count',
    socialFollowingCount: 'social_following_count',
    helpfulReviewCount: 'helpful_review_count',
    useCase: 'use_case',
    painPoint: 'pain_point',
    skillLevel: 'skill_level',
    teamOrSolo: 'team_or_solo',
    useType: 'use_type',
    previousCompetitor: 'previous_competitor',
    switchReason: 'switch_reason',
    favoriteFeature: 'favorite_feature',
    dislikedFeature: 'disliked_feature',
    futureGoals: 'future_goals',
    rfmRecencyScore: 'rfm_recency_score',
    rfmFrequencyScore: 'rfm_frequency_score',
    rfmMonetaryScore: 'rfm_monetary_score',
    rfmTotalScore: 'rfm_total_score',
    userSegment: 'user_segment',
    funnelLevel: 'funnel_level',
    funnelStage: 'funnel_stage',
    segmentUpdatedAt: 'segment_updated_at',
    churnRiskScore: 'churn_risk_score',
    isAtRisk: 'is_at_risk',
    isChurned: 'is_churned',
    isPriceSensitive: 'is_price_sensitive',
    isPremiumSeeker: 'is_premium_seeker',
    isDealHunter: 'is_deal_hunter',
    isMobileOnly: 'is_mobile_only',
    isDesktopOnly: 'is_desktop_only',
    lastLogin: 'last_login',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    extraData: 'extra_data',
    dynamicData: 'dynamic_data',
    authUserId: 'auth_user_id'
  };

  const result: any = {};
  for (const [key, value] of Object.entries(profile)) {
    if (mapping[key]) {
      result[mapping[key]] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Additional mapper functions would go here...
// (Keeping it concise for now, same pattern for all entities)

function mapDatabaseToUserAddress(data: any): UserAddress {
  return {
    id: data.id,
    userId: data.user_id,
    addressType: data.address_type,
    label: data.label,
    streetAddress: data.street_address,
    apartment: data.apartment,
    city: data.city,
    state: data.state,
    postalCode: data.postal_code,
    country: data.country,
    isDefault: data.is_default,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapUserAddressToDatabase(address: Partial<UserAddress>): any {
  return {
    user_id: address.userId,
    address_type: address.addressType,
    label: address.label,
    street_address: address.streetAddress,
    apartment: address.apartment,
    city: address.city,
    state: address.state,
    postal_code: address.postalCode,
    country: address.country,
    is_default: address.isDefault,
    latitude: address.latitude,
    longitude: address.longitude
  };
}

// Additional mapper functions
function mapDatabaseToUserPaymentMethod(data: any): UserPaymentMethod {
  return {
    id: data.id,
    userId: data.user_id,
    methodType: data.method_type,
    label: data.label,
    lastFour: data.last_four,
    cardBrand: data.card_brand,
    expiryMonth: data.expiry_month,
    expiryYear: data.expiry_year,
    accountNumberMasked: data.account_number_masked,
    isDefault: data.is_default,
    isVerified: data.is_verified,
    tokenReference: data.token_reference,
    createdAt: data.created_at,
    // Additional fields from SQL schema
    nickname: data.nickname,
    billingName: data.billing_name,
    billingAddressId: data.billing_address_id,
    isExpired: data.is_expired,
    lastUsedAt: data.last_used_at,
    useCount: data.use_count,
    failedCount: data.failed_count
  };
}

function mapUserPaymentMethodToDatabase(paymentMethod: Partial<UserPaymentMethod>): any {
  return {
    user_id: paymentMethod.userId,
    method_type: paymentMethod.methodType,
    label: paymentMethod.label,
    last_four: paymentMethod.lastFour,
    card_brand: paymentMethod.cardBrand,
    expiry_month: paymentMethod.expiryMonth,
    expiry_year: paymentMethod.expiryYear,
    account_number_masked: paymentMethod.accountNumberMasked,
    is_default: paymentMethod.isDefault,
    is_verified: paymentMethod.isVerified,
    token_reference: paymentMethod.tokenReference,
    // Additional fields from SQL schema
    nickname: paymentMethod.nickname,
    billing_name: paymentMethod.billingName,
    billing_address_id: paymentMethod.billingAddressId,
    is_expired: paymentMethod.isExpired,
    last_used_at: paymentMethod.lastUsedAt,
    use_count: paymentMethod.useCount,
    failed_count: paymentMethod.failedCount
  };
}

function mapDatabaseToUserDevice(data: any): UserDevice {
  return {
    id: data.id,
    userId: data.user_id,
    deviceName: data.device_name,
    deviceType: data.device_type,
    os: data.os,
    osVersion: data.os_version,
    browser: data.browser,
    browserVersion: data.browser_version,
    appVersion: data.app_version,
    screenSize: data.screen_size,
    deviceFingerprint: data.device_fingerprint,
    ipAddress: data.ip_address,
    location: data.location,
    isTrusted: data.is_trusted,
    isCurrent: data.is_current,
    lastUsedAt: data.last_used_at,
    firstSeenAt: data.first_seen_at,
    // Additional fields from SQL schema
    lastActive: data.last_active,
    is2faDevice: data.is_2fa_device,
    pushToken: data.push_token,
    notificationEnabled: data.notification_enabled,
    autoLoginEnabled: data.auto_login_enabled,
    biometricRegistered: data.biometric_registered,
    removedAt: data.removed_at,
    removeReason: data.remove_reason,
    deviceNickname: data.device_nickname,
    countryCode: data.country_code,
    cityName: data.city_name
  };
}

function mapUserDeviceToDatabase(device: Partial<UserDevice>): any {
  return {
    user_id: device.userId,
    device_name: device.deviceName,
    device_type: device.deviceType,
    os: device.os,
    os_version: device.osVersion,
    browser: device.browser,
    browser_version: device.browserVersion,
    app_version: device.appVersion,
    screen_size: device.screenSize,
    device_fingerprint: device.deviceFingerprint,
    ip_address: device.ipAddress,
    location: device.location,
    is_trusted: device.isTrusted,
    is_current: device.isCurrent,
    last_used_at: device.lastUsedAt,
    first_seen_at: device.firstSeenAt,
    // Additional fields from SQL schema
    last_active: device.lastActive,
    is_2fa_device: device.is2faDevice,
    push_token: device.pushToken,
    notification_enabled: device.notificationEnabled,
    auto_login_enabled: device.autoLoginEnabled,
    biometric_registered: device.biometricRegistered,
    removed_at: device.removedAt,
    remove_reason: device.removeReason,
    device_nickname: device.deviceNickname,
    country_code: device.countryCode,
    city_name: device.cityName
  };
}

function mapDatabaseToUserSession(data: any): UserSession {
  return {
    id: data.id,
    userId: data.user_id,
    sessionToken: data.session_token,
    deviceType: data.device_type,
    os: data.os,
    browser: data.browser,
    ipAddress: data.ip_address,
    location: data.location,
    rememberMe: data.remember_me,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    lastActivity: data.last_activity,
    deviceFingerprint: data.device_fingerprint,
    isTrustedDevice: data.is_trusted_device,
    userAgent: data.user_agent,
    browserFingerprint: data.browser_fingerprint,
    // Additional fields from SQL schema
    loginMethod: data.login_method,
    isSuspicious: data.is_suspicious,
    riskScore: data.risk_score,
    loggedOutAt: data.logged_out_at,
    logoutReason: data.logout_reason,
    loginNotificationSent: data.login_notification_sent,
    countryCode: data.country_code,
    cityName: data.city_name,
    osName: data.os_name,
    browserName: data.browser_name
  };
}

function mapUserSessionToDatabase(session: Partial<UserSession>): any {
  return {
    user_id: session.userId,
    session_token: session.sessionToken,
    device_type: session.deviceType,
    os: session.os,
    browser: session.browser,
    ip_address: session.ipAddress,
    location: session.location,
    remember_me: session.rememberMe,
    created_at: session.createdAt,
    expires_at: session.expiresAt,
    last_activity: session.lastActivity,
    device_fingerprint: session.deviceFingerprint,
    is_trusted_device: session.isTrustedDevice,
    user_agent: session.userAgent,
    browser_fingerprint: session.browserFingerprint,
    // Additional fields from SQL schema
    login_method: session.loginMethod,
    is_suspicious: session.isSuspicious,
    risk_score: session.riskScore,
    logged_out_at: session.loggedOutAt,
    logout_reason: session.logoutReason,
    login_notification_sent: session.loginNotificationSent,
    country_code: session.countryCode,
    city_name: session.cityName,
    os_name: session.osName,
    browser_name: session.browserName
  };
}

function mapDatabaseToUserConnectedApp(data: any): UserConnectedApp {
  return {
    id: data.id,
    userId: data.user_id,
    appId: data.app_id,
    appName: data.app_name,
    appIcon: data.app_icon,
    scopes: data.scopes,
    permissions: data.permissions,
    accessTokenRef: data.access_token_ref,
    refreshTokenRef: data.refresh_token_ref,
    tokenExpiresAt: data.token_expires_at,
    isActive: data.is_active,
    lastUsedAt: data.last_used_at,
    createdAt: data.created_at,
    // Additional fields from SQL schema
    appSlug: data.app_slug,
    appIconSvg: data.app_icon_svg,
    appDescription: data.app_description,
    appCategory: data.app_category,
    connectionType: data.connection_type,
    provider: data.provider,
    zipraAppId: data.zipra_app_id,
    providerUserId: data.provider_user_id,
    providerEmail: data.provider_email,
    providerUsername: data.provider_username,
    providerAvatar: data.provider_avatar,
    lastSyncedAt: data.last_synced_at,
    syncError: data.sync_error,
    disconnectedAt: data.disconnected_at,
    extraData: data.extra_data,
    dataAccessLastReviewedAt: data.data_access_last_reviewed_at,
    autoRevokeAfterDays: data.auto_revoke_after_days,
    canPostOnBehalf: data.can_post_on_behalf,
    canReadMessages: data.can_read_messages,
    canAccessContacts: data.can_access_contacts,
    canAccessLocation: data.can_access_location,
    riskLevel: data.risk_level
  };
}

function mapUserConnectedAppToDatabase(app: Partial<UserConnectedApp>): any {
  return {
    user_id: app.userId,
    app_id: app.appId,
    app_name: app.appName,
    app_icon: app.appIcon,
    scopes: app.scopes,
    permissions: app.permissions,
    access_token_ref: app.accessTokenRef,
    refresh_token_ref: app.refreshTokenRef,
    token_expires_at: app.tokenExpiresAt,
    is_active: app.isActive,
    last_used_at: app.lastUsedAt,
    created_at: app.createdAt,
    // Additional fields from SQL schema
    app_slug: app.appSlug,
    app_icon_svg: app.appIconSvg,
    app_description: app.appDescription,
    app_category: app.appCategory,
    connection_type: app.connectionType,
    provider: app.provider,
    zipra_app_id: app.zipraAppId,
    provider_user_id: app.providerUserId,
    provider_email: app.providerEmail,
    provider_username: app.providerUsername,
    provider_avatar: app.providerAvatar,
    last_synced_at: app.lastSyncedAt,
    sync_error: app.syncError,
    disconnected_at: app.disconnectedAt,
    extra_data: app.extraData,
    data_access_last_reviewed_at: app.dataAccessLastReviewedAt,
    auto_revoke_after_days: app.autoRevokeAfterDays,
    can_post_on_behalf: app.canPostOnBehalf,
    can_read_messages: app.canReadMessages,
    can_access_contacts: app.canAccessContacts,
    can_access_location: app.canAccessLocation,
    risk_level: app.riskLevel
  };
}

function mapDatabaseToUserNotificationSetting(data: any): UserNotificationSetting {
  return {
    id: data.id,
    userId: data.user_id,
    notificationType: data.notification_type,
    emailEnabled: data.email_enabled,
    smsEnabled: data.sms_enabled,
    pushEnabled: data.push_enabled,
    inAppEnabled: data.in_app_enabled,
    whatsappEnabled: data.whatsapp_enabled,
    frequency: data.frequency,
    quietHoursEnabled: data.quiet_hours_enabled,
    quietHoursStart: data.quiet_hours_start,
    quietHoursEnd: data.quiet_hours_end,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Additional fields from SQL schema
    telegramEnabled: data.telegram_enabled,
    desktopEnabled: data.desktop_enabled,
    soundEnabled: data.sound_enabled,
    vibrationEnabled: data.vibration_enabled,
    badgeCountEnabled: data.badge_count_enabled,
    previewInNotification: data.preview_in_notification,
    groupNotifications: data.group_notifications,
    notificationSound: data.notification_sound,
    priorityLevel: data.priority_level
  };
}

function mapUserNotificationSettingToDatabase(setting: Partial<UserNotificationSetting>): any {
  return {
    user_id: setting.userId,
    notification_type: setting.notificationType,
    email_enabled: setting.emailEnabled,
    sms_enabled: setting.smsEnabled,
    push_enabled: setting.pushEnabled,
    in_app_enabled: setting.inAppEnabled,
    whatsapp_enabled: setting.whatsappEnabled,
    frequency: setting.frequency,
    quiet_hours_enabled: setting.quietHoursEnabled,
    quiet_hours_start: setting.quietHoursStart,
    quiet_hours_end: setting.quietHoursEnd,
    created_at: setting.createdAt,
    updated_at: setting.updatedAt,
    // Additional fields from SQL schema
    telegram_enabled: setting.telegramEnabled,
    desktop_enabled: setting.desktopEnabled,
    sound_enabled: setting.soundEnabled,
    vibration_enabled: setting.vibrationEnabled,
    badge_count_enabled: setting.badgeCountEnabled,
    preview_in_notification: setting.previewInNotification,
    group_notifications: setting.groupNotifications,
    notification_sound: setting.notificationSound,
    priority_level: setting.priorityLevel
  };
}

function mapDatabaseToUserPrivacySetting(data: any): UserPrivacySetting {
  return {
    id: data.id,
    userId: data.user_id,
    analyticsConsent: data.analytics_consent,
    marketingConsent: data.marketing_consent,
    personalizationConsent: data.personalization_consent,
    thirdPartySharing: data.third_party_sharing,
    cookieConsent: data.cookie_consent,
    dataRetentionYears: data.data_retention_years,
    consentedAt: data.consented_at,
    lastUpdated: data.last_updated,
    // Additional fields from SQL schema
    profileSearchVisibility: data.profile_search_visibility,
    showOnlineStatus: data.show_online_status,
    showLastSeen: data.show_last_seen,
    showReadReceipts: data.show_read_receipts,
    allowFriendRequests: data.allow_friend_requests
  };
}

function mapUserPrivacySettingToDatabase(setting: Partial<UserPrivacySetting>): any {
  return {
    user_id: setting.userId,
    analytics_consent: setting.analyticsConsent,
    marketing_consent: setting.marketingConsent,
    personalization_consent: setting.personalizationConsent,
    third_party_sharing: setting.thirdPartySharing,
    cookie_consent: setting.cookieConsent,
    data_retention_years: setting.dataRetentionYears,
    consented_at: setting.consentedAt,
    last_updated: setting.lastUpdated,
    // Additional fields from SQL schema
    profile_search_visibility: setting.profileSearchVisibility,
    show_online_status: setting.showOnlineStatus,
    show_last_seen: setting.showLastSeen,
    show_read_receipts: setting.showReadReceipts,
    allow_friend_requests: setting.allowFriendRequests
  };
}

function mapDatabaseToUserActivityLog(data: any): UserActivityLog {
  return {
    id: data.id,
    userId: data.user_id,
    action: data.action,
    metadata: data.metadata,
    deviceType: data.device_type,
    deviceName: data.device_name,
    browser: data.browser,
    os: data.os,
    ipAddress: data.ip_address,
    location: data.location,
    createdAt: data.created_at,
    isSuspicious: data.is_suspicious
  };
}

function mapUserActivityLogToDatabase(log: Partial<UserActivityLog>): any {
  return {
    user_id: log.userId,
    action: log.action,
    metadata: log.metadata,
    device_type: log.deviceType,
    device_name: log.deviceName,
    browser: log.browser,
    os: log.os,
    ip_address: log.ipAddress,
    location: log.location,
    is_suspicious: log.isSuspicious
  };
}

function mapDatabaseToUserWallet(data: any): UserWallet {
  return {
    id: data.id,
    userId: data.user_id,
    balance: data.balance,
    currency: data.currency,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    // Additional fields from SQL schema
    dailyLimit: data.daily_limit,
    monthlyLimit: data.monthly_limit,
    withdrawalPinHash: data.withdrawal_pin_hash,
    isFrozen: data.is_frozen,
    freezeReason: data.freeze_reason,
    cashbackBalance: data.cashback_balance,
    rewardBalance: data.reward_balance
  };
}

function mapUserWalletToDatabase(wallet: Partial<UserWallet>): any {
  return {
    user_id: wallet.userId,
    balance: wallet.balance,
    currency: wallet.currency,
    is_active: wallet.isActive,
    // Additional fields from SQL schema
    daily_limit: wallet.dailyLimit,
    monthly_limit: wallet.monthlyLimit,
    withdrawal_pin_hash: wallet.withdrawalPinHash,
    is_frozen: wallet.isFrozen,
    freeze_reason: wallet.freezeReason,
    cashback_balance: wallet.cashbackBalance,
    reward_balance: wallet.rewardBalance
  };
}

function mapDatabaseToUserWalletTransaction(data: any): UserWalletTransaction {
  return {
    id: data.id,
    walletId: data.wallet_id,
    userId: data.user_id,
    type: data.type,
    amount: data.amount,
    balanceAfter: data.balance_after,
    description: data.description,
    referenceId: data.reference_id,
    status: data.status,
    createdAt: data.created_at
  };
}

function mapUserWalletTransactionToDatabase(transaction: Partial<UserWalletTransaction>): any {
  return {
    wallet_id: transaction.walletId,
    user_id: transaction.userId,
    type: transaction.type,
    amount: transaction.amount,
    balance_after: transaction.balanceAfter,
    description: transaction.description,
    reference_id: transaction.referenceId,
    status: transaction.status
  };
}

function mapDatabaseToUserSubscription(data: any): UserSubscription {
  return {
    id: data.id,
    userId: data.user_id,
    planName: data.plan_name,
    planType: data.plan_type,
    billingCycle: data.billing_cycle,
    price: data.price,
    currency: data.currency,
    status: data.status,
    trialEndsAt: data.trial_ends_at,
    currentPeriodStart: data.current_period_start,
    currentPeriodEnd: data.current_period_end,
    cancelledAt: data.cancelled_at,
    cancelReason: data.cancel_reason,
    paymentMethod: data.payment_method,
    autoRenew: data.auto_renew,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    planId: data.plan_id,
    // Additional fields from SQL schema
    upgradeFromPlan: data.upgrade_from_plan,
    downgradeToPlan: data.downgrade_to_plan,
    pauseReason: data.pause_reason,
    pauseUntil: data.pause_until,
    renewalReminderSent: data.renewal_reminder_sent,
    failedPaymentCount: data.failed_payment_count,
    lastFailedPaymentAt: data.last_failed_payment_at
  };
}

function mapUserSubscriptionToDatabase(subscription: Partial<UserSubscription>): any {
  return {
    user_id: subscription.userId,
    plan_name: subscription.planName,
    plan_type: subscription.planType,
    billing_cycle: subscription.billingCycle,
    price: subscription.price,
    currency: subscription.currency,
    status: subscription.status,
    trial_ends_at: subscription.trialEndsAt,
    current_period_start: subscription.currentPeriodStart,
    current_period_end: subscription.currentPeriodEnd,
    cancelled_at: subscription.cancelledAt,
    cancel_reason: subscription.cancelReason,
    payment_method: subscription.paymentMethod,
    auto_renew: subscription.autoRenew,
    plan_id: subscription.planId,
    // Additional fields from SQL schema
    upgrade_from_plan: subscription.upgradeFromPlan,
    downgrade_to_plan: subscription.downgradeToPlan,
    pause_reason: subscription.pauseReason,
    pause_until: subscription.pauseUntil,
    renewal_reminder_sent: subscription.renewalReminderSent,
    failed_payment_count: subscription.failedPaymentCount,
    last_failed_payment_at: subscription.lastFailedPaymentAt
  };
}

function mapDatabaseToUserPurchase(data: any): UserPurchase {
  return {
    id: data.id,
    userId: data.user_id,
    orderId: data.order_id,
    productId: data.product_id,
    productName: data.product_name,
    category: data.category,
    quantity: data.quantity,
    unitPrice: data.unit_price,
    totalPrice: data.total_price,
    discountAmount: data.discount_amount,
    couponCode: data.coupon_code,
    paymentMethod: data.payment_method,
    currency: data.currency,
    status: data.status,
    isGift: data.is_gift,
    giftFor: data.gift_for,
    deviceType: data.device_type,
    ipAddress: data.ip_address,
    purchasedAt: data.purchased_at,
    refundedAt: data.refunded_at,
    isEcoFriendly: data.is_eco_friendly,
    carbonFootprintKg: data.carbon_footprint_kg,
    sustainabilityScore: data.sustainability_score,
    // Additional fields from SQL schema
    deliveryDate: data.delivery_date,
    reviewReminderSent: data.review_reminder_sent,
    isDigital: data.is_digital,
    downloadLink: data.download_link,
    warrantyExpiresAt: data.warranty_expires_at,
    insuranceAdded: data.insurance_added
  };
}

function mapUserPurchaseToDatabase(purchase: Partial<UserPurchase>): any {
  return {
    user_id: purchase.userId,
    order_id: purchase.orderId,
    product_id: purchase.productId,
    product_name: purchase.productName,
    category: purchase.category,
    quantity: purchase.quantity,
    unit_price: purchase.unitPrice,
    total_price: purchase.totalPrice,
    discount_amount: purchase.discountAmount,
    coupon_code: purchase.couponCode,
    payment_method: purchase.paymentMethod,
    currency: purchase.currency,
    status: purchase.status,
    is_gift: purchase.isGift,
    gift_for: purchase.giftFor,
    device_type: purchase.deviceType,
    ip_address: purchase.ipAddress,
    purchased_at: purchase.purchasedAt,
    refunded_at: purchase.refundedAt,
    is_eco_friendly: purchase.isEcoFriendly,
    carbon_footprint_kg: purchase.carbonFootprintKg,
    sustainability_score: purchase.sustainabilityScore,
    // Additional fields from SQL schema
    delivery_date: purchase.deliveryDate,
    review_reminder_sent: purchase.reviewReminderSent,
    is_digital: purchase.isDigital,
    download_link: purchase.downloadLink,
    warranty_expires_at: purchase.warrantyExpiresAt,
    insurance_added: purchase.insuranceAdded
  };
}

function mapDatabaseToUserWishlist(data: any): UserWishlist {
  return {
    id: data.id,
    userId: data.user_id,
    productId: data.product_id,
    productName: data.product_name,
    priceWhenAdded: data.price_when_added,
    currentPrice: data.current_price,
    priceDropped: data.price_dropped,
    addedAt: data.added_at,
    listId: data.list_id
  };
}

function mapUserWishlistToDatabase(wishlist: Partial<UserWishlist>): any {
  return {
    user_id: wishlist.userId,
    product_id: wishlist.productId,
    product_name: wishlist.productName,
    price_when_added: wishlist.priceWhenAdded,
    current_price: wishlist.currentPrice,
    price_dropped: wishlist.priceDropped,
    list_id: wishlist.listId
  };
}

function mapDatabaseToUserCart(data: any): UserCart {
  return {
    id: data.id,
    userId: data.user_id,
    productId: data.product_id,
    productName: data.product_name,
    quantity: data.quantity,
    unitPrice: data.unit_price,
    totalPrice: data.total_price,
    addedAt: data.added_at,
    updatedAt: data.updated_at
  };
}

function mapUserCartToDatabase(cart: Partial<UserCart>): any {
  return {
    user_id: cart.userId,
    product_id: cart.productId,
    product_name: cart.productName,
    quantity: cart.quantity,
    unit_price: cart.unitPrice,
    total_price: cart.totalPrice,
    updated_at: cart.updatedAt
  };
}

function mapDatabaseToUserSocialAccount(data: any): UserSocialAccount {
  return {
    id: data.id,
    userId: data.user_id,
    provider: data.provider,
    providerUserId: data.provider_user_id,
    providerEmail: data.provider_email,
    providerName: data.provider_name,
    providerAvatar: data.provider_avatar,
    accessTokenRef: data.access_token_ref,
    isPrimary: data.is_primary,
    linkedAt: data.linked_at,
    lastUsedAt: data.last_used_at,
    // Additional fields from SQL schema
    isVerified: data.is_verified,
    followerCount: data.follower_count,
    scopeGranted: data.scope_granted,
    canPost: data.can_post,
    autoShareEnabled: data.auto_share_enabled
  };
}

function mapUserSocialAccountToDatabase(account: Partial<UserSocialAccount>): any {
  return {
    user_id: account.userId,
    provider: account.provider,
    provider_user_id: account.providerUserId,
    provider_email: account.providerEmail,
    provider_name: account.providerName,
    provider_avatar: account.providerAvatar,
    access_token_ref: account.accessTokenRef,
    is_primary: account.isPrimary,
    linked_at: account.linkedAt,
    last_used_at: account.lastUsedAt,
    // Additional fields from SQL schema
    is_verified: account.isVerified,
    follower_count: account.followerCount,
    scope_granted: account.scopeGranted,
    can_post: account.canPost,
    auto_share_enabled: account.autoShareEnabled
  };
}

function mapDatabaseToUserBadge(data: any): UserBadge {
  return {
    id: data.id,
    userId: data.user_id,
    badgeId: data.badge_id,
    badgeName: data.badge_name,
    badgeIcon: data.badge_icon,
    badgeDescription: data.badge_description,
    earnedAt: data.earned_at,
    isDisplayed: data.is_displayed,
    displayOrder: data.display_order
  };
}

function mapUserBadgeToDatabase(badge: Partial<UserBadge>): any {
  return {
    user_id: badge.userId,
    badge_id: badge.badgeId,
    badge_name: badge.badgeName,
    badge_icon: badge.badgeIcon,
    badge_description: badge.badgeDescription,
    is_displayed: badge.isDisplayed,
    display_order: badge.displayOrder
  };
}

function mapDatabaseToUserMilestone(data: any): UserMilestone {
  return {
    id: data.id,
    userId: data.user_id,
    milestoneType: data.milestone_type,
    title: data.title,
    description: data.description,
    pointsAwarded: data.points_awarded,
    achievedAt: data.achieved_at
  };
}

function mapUserMilestoneToDatabase(milestone: Partial<UserMilestone>): any {
  return {
    user_id: milestone.userId,
    milestone_type: milestone.milestoneType,
    title: milestone.title,
    description: milestone.description,
    points_awarded: milestone.pointsAwarded
  };
}

function mapDatabaseToUserStreak(data: any): UserStreak {
  return {
    id: data.id,
    userId: data.user_id,
    currentStreak: data.current_streak,
    longestStreak: data.longest_streak,
    lastCheckinDate: data.last_checkin_date,
    streakStartedAt: data.streak_started_at,
    totalCheckins: data.total_checkins
  };
}

function mapUserStreakToDatabase(streak: Partial<UserStreak>): any {
  return {
    user_id: streak.userId,
    current_streak: streak.currentStreak,
    longest_streak: streak.longestStreak,
    last_checkin_date: streak.lastCheckinDate,
    streak_started_at: streak.streakStartedAt,
    total_checkins: streak.totalCheckins
  };
}

function mapDatabaseToUserNote(data: any): UserNote {
  return {
    id: data.id,
    userId: data.user_id,
    orgId: data.org_id,
    title: data.title,
    content: data.content,
    contentJson: data.content_json,
    type: data.type,
    color: data.color,
    isPinned: data.is_pinned,
    isShared: data.is_shared,
    isTrashed: data.is_trashed,
    tags: data.tags,
    wordCount: data.word_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapUserNoteToDatabase(note: Partial<UserNote>): any {
  return {
    user_id: note.userId,
    org_id: note.orgId,
    title: note.title,
    content: note.content,
    content_json: note.contentJson,
    type: note.type,
    color: note.color,
    is_pinned: note.isPinned,
    is_shared: note.isShared,
    is_trashed: note.isTrashed,
    tags: note.tags,
    word_count: note.wordCount,
    updated_at: note.updatedAt
  };
}

function mapDatabaseToUserSupportTicket(data: any): UserSupportTicket {
  return {
    id: data.id,
    userId: data.user_id,
    ticketNumber: data.ticket_number,
    category: data.category,
    priority: data.priority,
    subject: data.subject,
    message: data.message,
    status: data.status,
    assignedTo: data.assigned_to,
    resolution: data.resolution,
    satisfactionRating: data.satisfaction_rating,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    resolvedAt: data.resolved_at,
    assignedAgentId: data.assigned_agent_id
  };
}

function mapUserSupportTicketToDatabase(ticket: Partial<UserSupportTicket>): any {
  return {
    user_id: ticket.userId,
    ticket_number: ticket.ticketNumber,
    category: ticket.category,
    priority: ticket.priority,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    assigned_to: ticket.assignedTo,
    resolution: ticket.resolution,
    satisfaction_rating: ticket.satisfactionRating,
    resolved_at: ticket.resolvedAt,
    assigned_agent_id: ticket.assignedAgentId
  };
}

function mapDatabaseToUserNotification(data: any): UserNotification {
  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    category: data.category,
    title: data.title,
    body: data.body,
    data: data.data,
    segmentCode: data.segment_code,
    campaignId: data.campaign_id,
    isSent: data.is_sent,
    isDelivered: data.is_delivered,
    isOpened: data.is_opened,
    isClicked: data.is_clicked,
    sentAt: data.sent_at,
    deliveredAt: data.delivered_at,
    openedAt: data.opened_at,
    clickedAt: data.clicked_at,
    scheduledAt: data.scheduled_at,
    createdAt: data.created_at
  };
}

function mapUserNotificationToDatabase(notification: Partial<UserNotification>): any {
  return {
    user_id: notification.userId,
    type: notification.type,
    category: notification.category,
    title: notification.title,
    body: notification.body,
    data: notification.data,
    segment_code: notification.segmentCode,
    campaign_id: notification.campaignId,
    is_sent: notification.isSent,
    is_delivered: notification.isDelivered,
    is_opened: notification.isOpened,
    is_clicked: notification.isClicked,
    sent_at: notification.sentAt,
    delivered_at: notification.deliveredAt,
    opened_at: notification.openedAt,
    clicked_at: notification.clickedAt,
    scheduled_at: notification.scheduledAt
  };
}

function mapDatabaseToUserTwoFA(data: any): UserTwoFA {
  return {
    id: data.id,
    userId: data.user_id,
    method: data.method,
    secretRef: data.secret_key,
    backupCodes: data.backup_codes,
    isEnabled: data.is_enabled,
    isVerified: data.is_verified,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at,
    // Additional fields from SQL schema
    totpAppName: data.totp_app_name,
    smsPhone: data.sms_phone,
    backupCodesGeneratedAt: data.backup_codes_generated_at,
    backupCodesUsedCount: data.backup_codes_used_count,
    recoveryCodesRemaining: data.recovery_codes_remaining,
    gracePeriodEndsAt: data.grace_period_ends_at,
    hardwareKeyType: data.hardware_key_type,
    hardwareKeyRegisteredAt: data.hardware_key_registered_at
  };
}

function mapUserTwoFAToDatabase(twoFA: Partial<UserTwoFA>): any {
  return {
    user_id: twoFA.userId,
    method: twoFA.method,
    secret_key: twoFA.secretRef,
    backup_codes: twoFA.backupCodes,
    is_enabled: twoFA.isEnabled,
    is_verified: twoFA.isVerified,
    last_used_at: twoFA.lastUsedAt,
    // Additional fields from SQL schema
    totp_app_name: twoFA.totpAppName,
    sms_phone: twoFA.smsPhone,
    backup_codes_generated_at: twoFA.backupCodesGeneratedAt,
    backup_codes_used_count: twoFA.backupCodesUsedCount,
    recovery_codes_remaining: twoFA.recoveryCodesRemaining,
    grace_period_ends_at: twoFA.gracePeriodEndsAt,
    hardware_key_type: twoFA.hardwareKeyType,
    hardware_key_registered_at: twoFA.hardwareKeyRegisteredAt
  };
}

function mapDatabaseToUserPasskey(data: any): UserPasskey {
  return {
    id: data.id,
    userId: data.user_id,
    credentialId: data.credential_id,
    publicKey: data.public_key,
    counter: data.counter,
    deviceType: data.device_type,
    deviceName: data.device_name,
    aaguid: data.aaguid,
    transports: data.transports,
    isBackupEligible: data.is_backup_eligible,
    isBackupState: data.is_backup_state,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at
  };
}

function mapUserPasskeyToDatabase(passkey: Partial<UserPasskey>): any {
  return {
    user_id: passkey.userId,
    credential_id: passkey.credentialId,
    public_key: passkey.publicKey,
    counter: passkey.counter,
    device_type: passkey.deviceType,
    device_name: passkey.deviceName,
    aaguid: passkey.aaguid,
    transports: passkey.transports,
    is_backup_eligible: passkey.isBackupEligible,
    is_backup_state: passkey.isBackupState,
    last_used_at: passkey.lastUsedAt
  };
}

function mapDatabaseToUserOnboarding(data: any): UserOnboarding {
  return {
    id: data.id,
    userId: data.user_id,
    stepProfileDone: data.step_profile_done,
    stepInterestsDone: data.step_interests_done,
    stepFirstProductViewed: data.step_first_product_viewed,
    stepFirstPurchaseDone: data.step_first_purchase_done,
    stepNotificationSetup: data.step_notification_setup,
    stepReferralShared: data.step_referral_shared,
    onboardingCompleted: data.onboarding_completed,
    completedAt: data.completed_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapUserOnboardingToDatabase(onboarding: Partial<UserOnboarding>): any {
  return {
    user_id: onboarding.userId,
    step_profile_done: onboarding.stepProfileDone,
    step_interests_done: onboarding.stepInterestsDone,
    step_first_product_viewed: onboarding.stepFirstProductViewed,
    step_first_purchase_done: onboarding.stepFirstPurchaseDone,
    step_notification_setup: onboarding.stepNotificationSetup,
    step_referral_shared: onboarding.stepReferralShared,
    onboarding_completed: onboarding.onboardingCompleted,
    completed_at: onboarding.completedAt,
    updated_at: onboarding.updatedAt
  };
}

// Export all mapper functions
export const mappers = {
  mapDatabaseToUserProfile,
  mapUserProfileToDatabase,
  mapDatabaseToUserAddress,
  mapUserAddressToDatabase,
  mapDatabaseToUserPaymentMethod,
  mapUserPaymentMethodToDatabase,
  mapDatabaseToUserDevice,
  mapUserDeviceToDatabase,
  mapDatabaseToUserSession,
  mapUserSessionToDatabase,
  mapDatabaseToUserConnectedApp,
  mapUserConnectedAppToDatabase,
  mapDatabaseToUserNotificationSetting,
  mapUserNotificationSettingToDatabase,
  mapDatabaseToUserPrivacySetting,
  mapUserPrivacySettingToDatabase,
  mapDatabaseToUserActivityLog,
  mapUserActivityLogToDatabase,
  mapDatabaseToUserWallet,
  mapUserWalletToDatabase,
  mapDatabaseToUserWalletTransaction,
  mapUserWalletTransactionToDatabase,
  mapDatabaseToUserSubscription,
  mapUserSubscriptionToDatabase,
  mapDatabaseToUserPurchase,
  mapUserPurchaseToDatabase,
  mapDatabaseToUserWishlist,
  mapUserWishlistToDatabase,
  mapDatabaseToUserCart,
  mapUserCartToDatabase,
  mapDatabaseToUserSocialAccount,
  mapUserSocialAccountToDatabase,
  mapDatabaseToUserBadge,
  mapUserBadgeToDatabase,
  mapDatabaseToUserMilestone,
  mapUserMilestoneToDatabase,
  mapDatabaseToUserStreak,
  mapUserStreakToDatabase,
  mapDatabaseToUserNote,
  mapUserNoteToDatabase,
  mapDatabaseToUserSupportTicket,
  mapUserSupportTicketToDatabase,
  mapDatabaseToUserNotification,
  mapUserNotificationToDatabase,
  mapDatabaseToUserTwoFA,
  mapUserTwoFAToDatabase,
  mapDatabaseToUserPasskey,
  mapUserPasskeyToDatabase,
  mapDatabaseToUserOnboarding,
  mapUserOnboardingToDatabase
};

// ==================== ENHANCED ACCOUNT MANAGEMENT ====================

export const getUserAuditLogs = async (userId: string, limit: number = 100): Promise<UserAuditLog[]> => {
  const { data, error } = await supabase
    .from('user_audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserAuditLog);
};

export const getUserBackupCodes = async (userId: string): Promise<UserBackupCode[]> => {
  const { data, error } = await supabase
    .from('user_backup_codes')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserBackupCode);
};

export const getUserAccountRecoveryOptions = async (userId: string): Promise<UserAccountRecovery[]> => {
  const { data, error } = await supabase
    .from('user_account_recovery')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserAccountRecovery);
};

export const getUserSecurityQuestions = async (userId: string): Promise<UserSecurityQuestion[]> => {
  const { data, error } = await supabase
    .from('user_security_questions')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSecurityQuestion);
};

export const getUserTrustedDevices = async (userId: string): Promise<UserTrustedDevice[]> => {
  const { data, error } = await supabase
    .from('user_trusted_devices')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserTrustedDevice);
};

export const getUserSessionPreferences = async (userId: string): Promise<UserSessionPreference[]> => {
  const { data, error } = await supabase
    .from('user_session_preferences')
    .select('*')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserSessionPreference);
};

export const getUserAccountHistory = async (userId: string, limit: number = 50): Promise<UserAccountHistory[]> => {
  const { data, error } = await supabase
    .from('user_account_history')
    .select('*')
    .eq('user_id', userId)
    .order('changed_at', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToUserAccountHistory);
};

export const getUserLoginHistory = async (userId: string, limit: number = 100): Promise<LoginHistory[]> => {
  const { data, error } = await supabase
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .order('login_time', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  return data.map(mapDatabaseToLoginHistory);
};


// ==================== DATA MAPPERS FOR ENHANCED ACCOUNT MANAGEMENT ====================

function mapDatabaseToUserAuditLog(data: any): UserAuditLog {
  return {
    id: data.id,
    userId: data.user_id,
    action: data.action,
    tableName: data.table_name,
    recordId: data.record_id,
    oldValues: data.old_values,
    newValues: data.new_values,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    createdAt: data.created_at
  };
}

function mapUserAuditLogToDatabase(auditLog: Partial<UserAuditLog>): any {
  return {
    user_id: auditLog.userId,
    action: auditLog.action,
    table_name: auditLog.tableName,
    record_id: auditLog.recordId,
    old_values: auditLog.oldValues,
    new_values: auditLog.newValues,
    ip_address: auditLog.ipAddress,
    user_agent: auditLog.userAgent
  };
}

function mapDatabaseToUserBackupCode(data: any): UserBackupCode {
  return {
    id: data.id,
    userId: data.user_id,
    backupCodeHash: data.backup_code_hash,
    isUsed: data.is_used,
    usedAt: data.used_at,
    createdAt: data.created_at
  };
}

function mapUserBackupCodeToDatabase(backupCode: Partial<UserBackupCode>): any {
  return {
    user_id: backupCode.userId,
    backup_code_hash: backupCode.backupCodeHash,
    is_used: backupCode.isUsed,
    used_at: backupCode.usedAt
  };
}

function mapDatabaseToUserAccountRecovery(data: any): UserAccountRecovery {
  return {
    id: data.id,
    userId: data.user_id,
    recoveryType: data.recovery_type,
    recoveryValue: data.recovery_value,
    isVerified: data.is_verified,
    verifiedAt: data.verified_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

function mapUserAccountRecoveryToDatabase(recovery: Partial<UserAccountRecovery>): any {
  return {
    user_id: recovery.userId,
    recovery_type: recovery.recoveryType,
    recovery_value: recovery.recoveryValue,
    is_verified: recovery.isVerified,
    verified_at: recovery.verifiedAt,
    updated_at: recovery.updatedAt
  };
}

function mapDatabaseToUserSecurityQuestion(data: any): UserSecurityQuestion {
  return {
    id: data.id,
    userId: data.user_id,
    question: data.question,
    answerHash: data.answer_hash,
    createdAt: data.created_at
  };
}

function mapUserSecurityQuestionToDatabase(question: Partial<UserSecurityQuestion>): any {
  return {
    user_id: question.userId,
    question: question.question,
    answer_hash: question.answerHash
  };
}

function mapDatabaseToUserTrustedDevice(data: any): UserTrustedDevice {
  return {
    id: data.id,
    userId: data.user_id,
    deviceId: data.device_id,
    deviceName: data.device_name,
    deviceType: data.device_type,
    os: data.os,
    browser: data.browser,
    fingerprint: data.fingerprint,
    ipAddress: data.ip_address,
    isTrusted: data.is_trusted,
    trustedUntil: data.trusted_until,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at
  };
}

function mapUserTrustedDeviceToDatabase(device: Partial<UserTrustedDevice>): any {
  return {
    user_id: device.userId,
    device_id: device.deviceId,
    device_name: device.deviceName,
    device_type: device.deviceType,
    os: device.os,
    browser: device.browser,
    fingerprint: device.fingerprint,
    ip_address: device.ipAddress,
    is_trusted: device.isTrusted,
    trusted_until: device.trustedUntil,
    last_used_at: device.lastUsedAt
  };
}

function mapDatabaseToUserSessionPreference(data: any): UserSessionPreference {
  return {
    id: data.id,
    userId: data.user_id,
    sessionId: data.session_id,
    preferences: data.preferences,
    createdAt: data.created_at,
    expiresAt: data.expires_at
  };
}

function mapUserSessionPreferenceToDatabase(preference: Partial<UserSessionPreference>): any {
  return {
    user_id: preference.userId,
    session_id: preference.sessionId,
    preferences: preference.preferences,
    expires_at: preference.expiresAt
  };
}

function mapDatabaseToUserAccountHistory(data: any): UserAccountHistory {
  return {
    id: data.id,
    userId: data.user_id,
    changeType: data.change_type,
    description: data.description,
    oldValue: data.old_value,
    newValue: data.new_value,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    changedAt: data.changed_at
  };
}

function mapUserAccountHistoryToDatabase(history: Partial<UserAccountHistory>): any {
  return {
    user_id: history.userId,
    change_type: history.changeType,
    description: history.description,
    old_value: history.oldValue,
    new_value: history.newValue,
    ip_address: history.ipAddress,
    user_agent: history.userAgent
  };
}

function mapDatabaseToLoginHistory(data: any): LoginHistory {
  return {
    id: data.id,
    userId: data.user_id,
    deviceName: data.device_name,
    deviceType: data.device_type,
    browser: data.browser,
    location: data.location,
    ipAddress: data.ip_address,
    loginTime: data.login_time,
    isCurrent: data.is_current,
    sessionId: data.session_id,
    success: data.success,
    failureReason: data.failure_reason
  };
}

function mapLoginHistoryToDatabase(loginHistory: Partial<LoginHistory>): any {
  return {
    user_id: loginHistory.userId,
    device_name: loginHistory.deviceName,
    device_type: loginHistory.deviceType,
    browser: loginHistory.browser,
    location: loginHistory.location,
    ip_address: loginHistory.ipAddress,
    login_time: loginHistory.loginTime,
    is_current: loginHistory.isCurrent,
    session_id: loginHistory.sessionId,
    success: loginHistory.success,
    failure_reason: loginHistory.failureReason
  };
}

// Export enhanced account management mapper functions
export const enhancedMappers = {
  mapDatabaseToUserAuditLog,
  mapUserAuditLogToDatabase,
  mapDatabaseToUserBackupCode,
  mapUserBackupCodeToDatabase,
  mapDatabaseToUserAccountRecovery,
  mapUserAccountRecoveryToDatabase,
  mapDatabaseToUserSecurityQuestion,
  mapUserSecurityQuestionToDatabase,
  mapDatabaseToUserTrustedDevice,
  mapUserTrustedDeviceToDatabase,
  mapDatabaseToUserSessionPreference,
  mapUserSessionPreferenceToDatabase,
  mapDatabaseToUserAccountHistory,
  mapUserAccountHistoryToDatabase,
  mapDatabaseToLoginHistory,
  mapLoginHistoryToDatabase
};

// Update the default export to include enhanced functions
export default {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserPaymentMethods,
  addPaymentMethod,
  setDefaultPaymentMethod,
  getUserDevices,
  trustDevice,
  removeDevice,
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
  getConnectedApps,
  disconnectApp,
  getNotificationSettings,
  updateNotificationSetting,
  getPrivacySettings,
  updatePrivacySettings,
  getActivityLogs,
  getUserWallet,
  getWalletTransactions,
  getUserSubscriptions,
  getUserPurchases,
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getUserSocialAccounts,
  disconnectSocialAccount,
  getUserBadges,
  getUserMilestones,
  getUserStreak,
  getUserNotes,
  createNote,
  updateNote,
  deleteNote,
  getUserSupportTickets,
  createSupportTicket,
  getUserNotifications,
  markNotificationAsRead,
  getUser2FA,
  getUserPasskeys,
  getUserOnboarding,
  updateOnboardingStep,
  // Enhanced Account Management Functions
  getUserAuditLogs,
  getUserBackupCodes,
  getUserAccountRecoveryOptions,
  getUserSecurityQuestions,
  getUserTrustedDevices,
  getUserSessionPreferences,
  getUserAccountHistory,
  getUserLoginHistory
};
