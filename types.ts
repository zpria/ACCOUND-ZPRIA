
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
