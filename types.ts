
export interface LogoVariant {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

export interface UserProfile {
  // Core Identity
  id: string;
  username: string;
  login_id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  address: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  
  // Verification & Status
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'banned' | 'deleted';
  
  // Security
  failedLoginAttempts: number;
  lastFailedLogin?: string;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'totp' | 'sms' | 'email' | 'backup_code';
  
  // Preferences
  themePreference: 'purple' | 'ocean' | 'dark' | 'coral' | 'lime' | 'forest' | 'indigo' | 'royal' | 'sunset' | 'nature';
  preferredFontSize?: 'small' | 'medium' | 'large';
  preferredLayout?: 'grid' | 'list';
  preferredContentType?: 'video' | 'text' | 'image' | 'mixed';
  preferredLanguage: string;
  preferredPaymentMethod?: string;
  preferredNotificationTime?: string;
  preferredCategory?: string;
  
  // Profile Media
  avatarUrl?: string;
  avatarBase64?: string;
  coverPhotoUrl?: string;
  bio?: string;
  
  // Personal Info
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'prefer_not_to_say';
  hasChildren: boolean;
  education?: string;
  occupation?: string;
  companyName?: string;
  industry?: string;
  monthlyIncomeRange?: string;
  religion?: string;
  lifestyle?: string;
  
  // Location
  country?: string;
  city?: string;
  area?: string;
  postalCode?: string;
  timezone?: string;
  language: string;
  currency: string;
  
  // Notifications
  emailNewsletter: boolean;
  smsNotification: boolean;
  whatsappNotification: boolean;
  pushNotification: boolean;
  
  // Activity Patterns
  mostActiveDay?: string;
  purchaseDayPreference?: string;
  mostActiveHour?: number;
  isMorningUser: boolean;
  isNightOwl: boolean;
  isWeekendShopper: boolean;
  
  // Interests
  interests: {
    music: boolean;
    gaming: boolean;
    sports: boolean;
    travel: boolean;
    parenting: boolean;
    automotive: boolean;
    technology: boolean;
    environment: boolean;
    photography: boolean;
    real_estate: boolean;
    food_cooking: boolean;
    ai_automation: boolean;
    books_reading: boolean;
    fashion_style: boolean;
    politics_news: boolean;
    health_fitness: boolean;
    education_learning: boolean;
    finance_investment: boolean;
    movies_entertainment: boolean;
    business_entrepreneurship: boolean;
  };
  interestScores: Record<string, number>;
  
  // Device Info
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  os?: string;
  browser?: string;
  screenSize?: string;
  connectionType?: 'wifi' | '4g' | '5g' | '3g' | 'unknown';
  appVersion?: string;
  locationPermission: boolean;
  cameraPermission: boolean;
  deviceFingerprint?: string;
  timezoneOffset?: number;
  
  // Behavior Data
  behaviorData: {
    top_page?: string;
    ad_history: any[];
    cart_count: number;
    active_hour?: number;
    last_search?: string;
    share_count: number;
    top_product?: string;
    bounce_count: number;
    top_category?: string;
    cart_abandoned: boolean;
    wishlist_count: number;
    payment_started: boolean;
    unused_features: string[];
    scroll_depth_avg: number;
    checkout_abandoned: boolean;
    last_viewed_product?: string;
    most_clicked_button?: string;
  };
  
  // Visit Stats
  firstVisitAt?: string;
  totalVisitCount: number;
  totalSessionMinutes: number;
  avgSessionMinutes: number;
  visitsPerWeek: number;
  pagesPerSession: number;
  daysSinceLastActivity: number;
  
  // Ad Stats
  adsSeenCount: number;
  adsClickedCount: number;
  adCtr: number;
  
  // E-commerce Status
  hasWishlist: boolean;
  hasCartItem: boolean;
  cartAbandoned: boolean;
  checkoutAbandoned: boolean;
  paymentStarted: boolean;
  requestedRefund: boolean;
  complaintCount: number;
  doesShare: boolean;
  doesReview: boolean;
  
  // Purchase Stats
  purchaseHourPreference?: string;
  totalPurchaseCount: number;
  totalSpent: number;
  averageOrderValue: number;
  maxSingleOrderValue: number;
  firstPurchaseDate?: string;
  lastPurchaseDate?: string;
  topPurchaseCategory?: string;
  topPurchaseProduct?: string;
  
  // Subscription
  isSubscriber: boolean;
  subscriptionPlan?: string;
  usedCoupon: boolean;
  usedDiscount: boolean;
  isTrialUser: boolean;
  hasUpgraded: boolean;
  hasDowngraded: boolean;
  isBulkBuyer: boolean;
  isGiftBuyer: boolean;
  
  // Referral
  referralSource?: string;
  referredBy?: string;
  referralCount: number;
  
  // Social
  isCommunityActive: boolean;
  isInfluencer: boolean;
  socialFollowerCount: number;
  socialFollowingCount: number;
  helpfulReviewCount: number;
  
  // User Feedback
  useCase?: string;
  painPoint?: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  teamOrSolo: 'solo' | 'team';
  useType: 'personal' | 'business';
  previousCompetitor?: string;
  switchReason?: string;
  favoriteFeature?: string;
  dislikedFeature?: string;
  futureGoals?: string;
  
  // RFM Scores
  rfmRecencyScore: number;
  rfmFrequencyScore: number;
  rfmMonetaryScore: number;
  rfmTotalScore: number;
  
  // Segmentation
  userSegment: string;
  funnelLevel: number;
  funnelStage: string;
  segmentUpdatedAt: string;
  
  // Risk
  churnRiskScore: number;
  isAtRisk: boolean;
  isChurned: boolean;
  isPriceSensitive: boolean;
  isPremiumSeeker: boolean;
  isDealHunter: boolean;
  isMobileOnly: boolean;
  isDesktopOnly: boolean;
  
  // Timestamps
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  
  // Extra Data
  extraData?: any;
  dynamicData: Record<string, any>;
  authUserId?: string;
  
  // Additional fields from SQL schema
  favoriteColor?: string;
  middleName?: string;
  namePronunciation?: string;
  pronouns?: string;
  customPronouns?: string;
  profileUrl?: string;
  websiteUrl?: string;
  profileCompletionPercent?: number;
  isVerifiedUser?: boolean;
  verifiedAt?: string;
  verificationBadgeType?: string;
  accountType?: string;
  isPublicFigure?: boolean;
  profileVisibility?: string;
  bioVisibility?: string;
  dobVisibility?: string;
  genderVisibility?: string;
  phoneVisibility?: string;
  emailVisibility?: string;
  locationVisibility?: string;
  workVisibility?: string;
  educationVisibility?: string;
  friendsVisibility?: string;
  postsVisibility?: string;
  taggedPostsVisibility?: string;
  mobileSecondary?: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  loginNotifyEveryLogin?: boolean;
  loginNotifyNewDeviceOnly?: boolean;
  loginNotifyViaEmail?: boolean;
  loginNotifyViaSms?: boolean;
  loginNotifyViaPush?: boolean;
  suspiciousLoginBlock?: boolean;
  passwordChangeNotify?: boolean;
  emailChangeNotify?: boolean;
  phoneChangeNotify?: boolean;
  lastPasswordChange?: string;
  passwordStrengthScore?: number;
  passkeyEnabled?: boolean;
  magicLinkEnabled?: boolean;
  biometricEnabled?: boolean;
  autoLogoutMinutes?: number;
  sessionLimit?: number;
  requirePasswordOnSensitive?: boolean;
  searchVisibility?: boolean;
  discoverableByEmail?: boolean;
  discoverableByPhone?: boolean;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
  showReadReceipts?: boolean;
  showTypingIndicator?: boolean;
  allowFriendRequests?: boolean;
  allowMessageFrom?: string;
  allowTagFrom?: string;
  allowMentionFrom?: string;
  hideFromSearchEngines?: boolean;
  faceRecognitionOptOut?: boolean;
  aiTrainingOptOut?: boolean;
  sensitiveContentFilter?: boolean;
  crossAppTrackingDisabled?: boolean;
  dataDownloadRequestedAt?: string;
  accountDeleteRequestedAt?: string;
  accountDeleteScheduledAt?: string;
  notifEmailMaster?: boolean;
  notifSmsMaster?: boolean;
  notifPushMaster?: boolean;
  notifInAppMaster?: boolean;
  notifWhatsappMaster?: boolean;
  darkMode?: boolean;
  autoDarkMode?: boolean;
  compactMode?: boolean;
  animationEnabled?: boolean;
  highContrast?: boolean;
  reduceMotion?: boolean;
  sidebarCollapsed?: boolean;
  fontScale?: number;
  dateFormat?: string;
  timeFormat?: string;
  firstDayOfWeek?: string;
  numberFormat?: string;
  measurementUnit?: string;
  screenReaderEnabled?: boolean;
  keyboardShortcutsEnabled?: boolean;
  focusMode?: boolean;
  dyslexiaFriendlyFont?: boolean;
  colorBlindMode?: string;
  closedCaptionsEnabled?: boolean;
  audioDescriptionEnabled?: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  theme: LogoVariant;
}

export interface ProductType {
  type_id: number;
  type_name: string;
  type_description: string;
  type_icon: string;
  type_question: string;
  display_order: number;
  is_active: boolean;
}

export interface ZipraProduct {
  id: number;
  product_id: string;
  product_name: string;
  product_url: string;
  description: string;
  long_description: string;
  product_type: string;
  type_label: string;
  benefits: string[] | any;
  features: string[] | any;
  process_steps: string[] | any;
  setup_guide: string;
  tags: string;
  requirements: string;
  documentation_url: string;
  support_url: string;
  icon_url: string;
  banner_url: string;
  screenshot_urls: string[] | any;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  target_audience: string;
  pricing_type: string;
  price: number;
  currency: string;
  version: string;
  total_users: number;
  rating: number;
  review_count: number;
  meta_title: string;
  meta_description: string;
  keywords: string;
  launched_at: string;
}

// ==================== USER RELATED TABLES ====================

export interface UserAddress {
  id: string;
  userId: string;
  addressType: 'home' | 'work' | 'billing' | 'shipping' | 'other';
  label?: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPaymentMethod {
  id: string;
  userId: string;
  methodType: 'card' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'bank_transfer' | 'paypal' | 'stripe' | 'crypto' | 'other';
  label?: string;
  lastFour?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  accountNumberMasked?: string;
  isDefault: boolean;
  isVerified: boolean;
  tokenReference?: string;
  createdAt: string;
  
  // Additional fields from SQL schema
  nickname?: string;
  billingName?: string;
  billingAddressId?: string;
  isExpired?: boolean;
  lastUsedAt?: string;
  useCount?: number;
  failedCount?: number;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceName?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'smartwatch' | 'tv' | 'other';
  os?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
  appVersion?: string;
  screenSize?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  location?: string;
  isTrusted: boolean;
  isCurrent: boolean;
  lastUsedAt: string;
  firstSeenAt: string;
  
  // Additional fields from SQL schema
  lastActive?: string;
  is2faDevice?: boolean;
  pushToken?: string;
  notificationEnabled?: boolean;
  autoLoginEnabled?: boolean;
  biometricRegistered?: boolean;
  removedAt?: string;
  removeReason?: string;
  deviceNickname?: string;
  countryCode?: string;
  cityName?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
  rememberMe: boolean;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  deviceFingerprint?: string;
  isTrustedDevice: boolean;
  userAgent?: string;
  browserFingerprint?: any;
  
  // Additional fields from SQL schema
  loginMethod?: string;
  isSuspicious?: boolean;
  riskScore?: number;
  loggedOutAt?: string;
  logoutReason?: string;
  loginNotificationSent?: boolean;
  countryCode?: string;
  cityName?: string;
  osName?: string;
  browserName?: string;
}

export interface UserConnectedApp {
  id: string;
  userId: string;
  appId: string;
  appName: string;
  appIcon?: string;
  scopes: string[];
  permissions: string[];
  accessTokenRef?: string;
  refreshTokenRef?: string;
  tokenExpiresAt?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  
  // Additional fields from SQL schema
  appSlug?: string;
  appIconSvg?: string;
  appDescription?: string;
  appCategory?: string;
  connectionType?: string;
  provider?: string;
  zipraAppId?: string;
  providerUserId?: string;
  providerEmail?: string;
  providerUsername?: string;
  providerAvatar?: string;
  lastSyncedAt?: string;
  syncError?: string;
  disconnectedAt?: string;
  extraData?: any;
  dataAccessLastReviewedAt?: string;
  autoRevokeAfterDays?: number;
  canPostOnBehalf?: boolean;
  canReadMessages?: boolean;
  canAccessContacts?: boolean;
  canAccessLocation?: boolean;
  riskLevel?: string;
}

export interface UserNotificationSetting {
  id: string;
  userId: string;
  notificationType: 'security_alerts' | 'account_activity' | 'product_updates' | 'newsletter' | 'social_activity' | 'promotions' | 'marketing' | 'verification_codes' | 'appointments' | 'messages' | 'mentions' | 'likes' | 'comments' | 'followers' | 'order_updates' | 'tips_tutorials' | 'achievements' | 'recommendations';
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields from SQL schema
  telegramEnabled?: boolean;
  desktopEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  badgeCountEnabled?: boolean;
  previewInNotification?: boolean;
  groupNotifications?: boolean;
  notificationSound?: string;
  priorityLevel?: string;
}

export interface UserPrivacySetting {
  id: string;
  userId: string;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  personalizationConsent: boolean;
  thirdPartySharing: boolean;
  cookieConsent: boolean;
  dataRetentionYears: number;
  consentedAt: string;
  lastUpdated: string;
  
  // Additional fields from SQL schema
  profileSearchVisibility?: boolean;
  showOnlineStatus?: boolean;
  showLastSeen?: boolean;
  showReadReceipts?: boolean;
  allowFriendRequests?: boolean;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  metadata?: any;
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  createdAt: string;
  isSuspicious?: boolean;
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Additional fields from SQL schema
  dailyLimit?: number;
  monthlyLimit?: number;
  withdrawalPinHash?: string;
  isFrozen?: boolean;
  freezeReason?: string;
  cashbackBalance?: number;
  rewardBalance?: number;
}

export interface UserWalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: 'topup' | 'purchase' | 'refund' | 'bonus' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'cashback';
  amount: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  createdAt: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planName: string;
  planType: 'free' | 'basic' | 'pro' | 'enterprise' | 'custom';
  billingCycle?: 'monthly' | 'yearly' | 'lifetime';
  price: number;
  currency: string;
  status: 'trial' | 'active' | 'paused' | 'cancelled' | 'expired';
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  cancelReason?: string;
  paymentMethod?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
  planId?: string;
  
  // Additional fields from SQL schema
  upgradeFromPlan?: string;
  downgradeToPlan?: string;
  pauseReason?: string;
  pauseUntil?: string;
  renewalReminderSent?: boolean;
  failedPaymentCount?: number;
  lastFailedPaymentAt?: string;
}

export interface UserPurchase {
  id: string;
  userId: string;
  orderId: string;
  productId: string;
  productName?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  couponCode?: string;
  paymentMethod?: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled';
  isGift: boolean;
  giftFor?: string;
  deviceType?: string;
  ipAddress?: string;
  purchasedAt: string;
  refundedAt?: string;
  isEcoFriendly: boolean;
  carbonFootprintKg?: number;
  sustainabilityScore?: number;
  
  // Additional fields from SQL schema
  deliveryDate?: string;
  reviewReminderSent?: boolean;
  isDigital?: boolean;
  downloadLink?: string;
  warrantyExpiresAt?: string;
  insuranceAdded?: boolean;
}

export interface UserWishlist {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  priceWhenAdded?: number;
  currentPrice?: number;
  priceDropped: boolean;
  addedAt: string;
  listId?: string;
}

export interface UserCart {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
  updatedAt: string;
}

export interface UserSocialAccount {
  id: string;
  userId: string;
  provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'github' | 'linkedin' | 'tiktok';
  providerUserId: string;
  providerEmail?: string;
  providerName?: string;
  providerAvatar?: string;
  accessTokenRef?: string;
  isPrimary: boolean;
  linkedAt: string;
  lastUsedAt?: string;
  
  // Additional fields from SQL schema
  isVerified?: boolean;
  followerCount?: number;
  scopeGranted?: string[];
  canPost?: boolean;
  autoShareEnabled?: boolean;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeIcon?: string;
  badgeDescription?: string;
  earnedAt: string;
  isDisplayed: boolean;
  displayOrder: number;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneType: 'first_login' | 'first_purchase' | '100_days' | '1_year' | 'spend_1000' | 'spend_10000' | 'referral_10' | 'review_10' | 'top_buyer_month' | 'top_buyer_year' | 'custom';
  title: string;
  description?: string;
  pointsAwarded: number;
  achievedAt: string;
}

export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate?: string;
  streakStartedAt?: string;
  totalCheckins: number;
}

export interface UserNote {
  id: string;
  userId: string;
  orgId?: string;
  title?: string;
  content?: string;
  contentJson?: any;
  type: 'note' | 'document' | 'spreadsheet' | 'presentation' | 'kanban' | 'whiteboard';
  color?: string;
  isPinned: boolean;
  isShared: boolean;
  isTrashed: boolean;
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSupportTicket {
  id: string;
  userId?: string;
  ticketNumber: string;
  category?: 'billing' | 'technical' | 'account' | 'product' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  satisfactionRating?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedAgentId?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app';
  category?: 'promotion' | 'reminder' | 'alert' | 'welcome' | 'win_back' | 'cart_recovery' | 'price_drop' | 'new_product' | 'system' | 'custom';
  title?: string;
  body?: string;
  data?: any;
  segmentCode?: string;
  campaignId?: string;
  isSent: boolean;
  isDelivered: boolean;
  isOpened: boolean;
  isClicked: boolean;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface UserTwoFA {
  id: string;
  userId: string;
  method: 'totp' | 'sms' | 'email' | 'backup_code';
  secretRef?: string;
  backupCodes?: string[];
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsedAt?: string;
  
  // Additional fields from SQL schema
  totpAppName?: string;
  smsPhone?: string;
  backupCodesGeneratedAt?: string;
  backupCodesUsedCount?: number;
  recoveryCodesRemaining?: number;
  gracePeriodEndsAt?: string;
  hardwareKeyType?: string;
  hardwareKeyRegisteredAt?: string;
}

export interface UserPasskey {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType?: 'platform' | 'cross-platform';
  deviceName?: string;
  aaguid?: string;
  transports?: string[];
  isBackupEligible: boolean;
  isBackupState: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface UserOnboarding {
  id: string;
  userId: string;
  stepProfileDone: boolean;
  stepInterestsDone: boolean;
  stepFirstProductViewed: boolean;
  stepFirstPurchaseDone: boolean;
  stepNotificationSetup: boolean;
  stepReferralShared: boolean;
  onboardingCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
