/**
 * Centralized Database Table Type Definitions
 * All TypeScript interfaces for database tables
 * Generated from public.sql schema
 */

// ==================== CORE USER TABLES ====================

export interface UsersTable {
  id: string;
  username: string;
  login_id: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile?: string;
  address: string;
  dob: string; // date
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  is_email_verified: boolean;
  is_mobile_verified: boolean;
  account_status: 'active' | 'suspended' | 'banned' | 'deleted';
  failed_login_attempts: number;
  last_failed_login?: string; // timestamp
  locked_until?: string; // timestamp
  last_login_at?: string; // timestamp
  created_at: string; // timestamp
  updated_at: string; // timestamp
  auth_user_id?: string;
  avatar_url?: string;
  cover_photo_url?: string;
  bio?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'prefer_not_to_say';
  has_children?: boolean;
  education?: string;
  occupation?: string;
  company_name?: string;
  industry?: string;
  monthly_income_range?: string;
  religion?: string;
  lifestyle?: string;
  country: string;
  city: string;
  area?: string;
  postal_code?: string;
  referral_source?: string;
  referred_by?: string;
  middle_name?: string;
  name_pronunciation?: string;
  pronouns?: string;
  custom_pronouns?: string;
  profile_url?: string;
  website_url?: string;
  profile_completion_percent?: number;
  is_verified_user?: boolean;
  verified_at?: string;
  verification_badge_type?: string;
  account_type?: 'personal' | 'business' | 'creator';
}

export interface UserAddressesTable {
  id: string;
  user_id: string;
  label?: 'Home' | 'Work' | 'Other';
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  area?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
  is_commercial: boolean;
  latitude?: number;
  longitude?: number;
  delivery_instructions?: string;
  gate_code?: string;
  building_name?: string;
  floor_number?: string;
  apartment_number?: string;
  landmark?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPaymentMethodsTable {
  id: string;
  user_id: string;
  type: 'card' | 'bank' | 'wallet' | 'crypto';
  provider: string;
  masked_number: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  billing_address?: string;
  cardholder_name?: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

// ==================== PRODUCT TABLES ====================

export interface ZipraProductsTable {
  id: string;
  product_id: string;
  product_name: string;
  product_url: string;
  description: string;
  long_description?: string;
  product_type: string;
  type_label: string;
  benefits?: string[];
  features?: string[];
  process_steps?: string[];
  setup_guide?: string;
  tags: string;
  requirements?: string;
  documentation_url?: string;
  support_url?: string;
  icon_url?: string;
  banner_url?: string;
  screenshot_urls?: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  target_audience?: string;
  pricing_type?: 'free' | 'freemium' | 'paid' | 'subscription';
  price?: number;
  currency?: string;
  version?: string;
  total_users?: number;
  rating?: number;
  review_count?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  launched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductTypesTable {
  type_id: string;
  type_name: string;
  type_description?: string;
  type_icon?: string;
  type_question?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoriesTable {
  id: string;
  category_name: string;
  category_slug: string;
  parent_category_id?: string;
  description?: string;
  icon_url?: string;
  banner_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImagesTable {
  id: string;
  product_id: string;
  image_url: string;
  image_type: 'primary' | 'gallery' | 'thumbnail' | 'banner';
  alt_text?: string;
  display_order: number;
  created_at: string;
}

export interface ProductInventoryTable {
  id: string;
  product_id: string;
  sku: string;
  quantity_available: number;
  quantity_reserved: number;
  reorder_level: number;
  warehouse_location?: string;
  last_stock_check?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductPricesTable {
  id: string;
  product_id: string;
  base_price: number;
  sale_price?: number;
  currency: string;
  discount_percentage?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRatingsTable {
  id: string;
  product_id: string;
  user_id: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  helpful_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReviewsTable {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  is_verified_purchase: boolean;
  helpful_count?: number;
  images?: string[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariantsTable {
  id: string;
  product_id: string;
  variant_name: string;
  variant_type: 'color' | 'size' | 'material' | 'other';
  variant_value: string;
  price_adjustment?: number;
  sku?: string;
  inventory_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== ORDER & CART TABLES ====================

export interface OrdersTable {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address?: string;
  billing_address?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItemsTable {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount: number;
  tax: number;
  created_at: string;
}

export interface UserCartsTable {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  max_quantity?: number;
  added_at: string;
  updated_at: string;
}

// ==================== AI TABLES ====================

export interface AiConversationsTable {
  id: string;
  user_id: string;
  title: string;
  model: string;
  total_messages: number;
  total_tokens: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiMessagesTable {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  model_used?: string;
  is_liked?: boolean;
  created_at: string;
}

export interface AiGeneratedContentTable {
  id: string;
  user_id: string;
  content_type: 'text' | 'image' | 'code' | 'email' | 'document' | 'social_post' | 'product_description';
  prompt: string;
  generated_content: string;
  model_used?: string;
  quality_score?: number;
  is_used: boolean;
  is_public: boolean;
  edited_version?: string;
  created_at: string;
}

export interface AiProductRecommendationsTable {
  id: string;
  user_id: string;
  product_id: string;
  recommendation_score: number;
  reasoning?: any;
  model_version?: string;
  factors?: any;
  is_shown: boolean;
  is_clicked: boolean;
  is_purchased: boolean;
  generated_at: string;
  expires_at: string;
}

export interface AiUsageStatsTable {
  id: string;
  user_id: string;
  total_conversations: number;
  total_messages: number;
  total_tokens_used: number;
  monthly_token_limit: number;
  monthly_tokens_used: number;
  reset_date: string;
  updated_at: string;
}

export interface AiChatHistoryTable {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// ==================== AUTHENTICATION & SECURITY TABLES ====================

export interface OneTimePasswordsTable {
  id: string;
  email: string;
  otp_code: string;
  purpose: 'registration' | 'password_reset' | 'email_verification' | 'phone_verification' | 'login';
  is_used: boolean;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

export interface OtpVerificationsTable {
  id: string;
  email: string;
  otp_code: string;
  purpose: string;
  is_used: boolean;
  used_at?: string;
  expires_at: string;
  created_at: string;
}

export interface PendingRegistrationsTable {
  id: string;
  username: string;
  login_id: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  dob: string;
  gender: string;
  address: string;
  country: string;
  created_at: string;
  expires_at: string;
}

export interface UserSessionsTable {
  id: string;
  user_id: string;
  session_token: string;
  device_id?: string;
  ip_address?: string;
  user_agent?: string;
  is_current: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface UserDevicesTable {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip_address?: string;
  location?: string;
  is_trusted: boolean;
  is_current: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface User2faTable {
  id: string;
  user_id: string;
  method: 'totp' | 'sms' | 'email' | 'backup_code';
  secret?: string;
  phone_number?: string;
  backup_codes?: string[];
  is_enabled: boolean;
  enabled_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== APP MANAGEMENT TABLES ====================

export interface UserConnectedAppsTable {
  id: string;
  user_id: string;
  zipra_app_id: string;
  permissions?: string[];
  is_active: boolean;
  connected_at: string;
  disconnected_at?: string;
  last_used?: string;
  app_category?: string;
  created_at: string;
  updated_at: string;
}

export interface ZipraAppsTable {
  id: string;
  app_name: string;
  app_slug: string;
  app_description: string;
  app_tagline?: string;
  app_icon_svg?: string;
  app_icon_url?: string;
  app_banner_url?: string;
  app_url?: string;
  product_id?: string;
  is_active: boolean;
  is_launched: boolean;
  display_order: number;
  category?: string;
  target_audience?: string;
  features?: string[];
  requirements?: string;
  documentation_url?: string;
  support_url?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  version?: string;
  total_users?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

// ==================== NOTIFICATION TABLES ====================

export interface NotificationsTable {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'alert';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_label?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at?: string;
}

export interface NotificationPreferencesTable {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  security_alerts: boolean;
  newsletter: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== ANALYTICS & LOGS TABLES ====================

export interface SystemHealthLogsTable {
  id: string;
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms?: number;
  error_message?: string;
  metadata?: any;
  checked_at: string;
  created_at: string;
}

export interface UserActivityLogsTable {
  id: string;
  user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserActivityHistoryTable {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  session_id?: string;
  device_id?: string;
  created_at: string;
}

export interface UserAiInteractionsTable {
  id: string;
  user_id: string;
  interaction_type: 'chat' | 'image_generation' | 'recommendation' | 'analysis';
  model_used?: string;
  tokens_consumed?: number;
  input_data?: any;
  output_data?: any;
  created_at: string;
}

export interface UserDailyActivityTable {
  id: string;
  user_id: string;
  activity_date: string;
  login_count?: number;
  page_views?: number;
  actions_performed?: number;
  time_spent_minutes?: number;
  devices_used?: string[];
  features_accessed?: string[];
  created_at: string;
  updated_at: string;
}

// ==================== UTILITY TABLES ====================

export interface FileUploadsTable {
  id: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  storage_provider: 'aws-s3' | 'cloudinary' | 'local';
  bucket_name?: string;
  is_public: boolean;
  uploaded_at: string;
  expires_at?: string;
  metadata?: any;
  created_at: string;
}

export interface AuditLogsTable {
  id: string;
  actor_id?: string;
  actor_role?: string;
  target_table?: string;
  target_id?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'ban' | 'unban' | 'role_assign' | 'config_change' | 'export' | 'import';
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
  created_at: string;
}

// Export type union for all tables
export type DatabaseTables = 
  | UsersTable
  | UserAddressesTable
  | UserPaymentMethodsTable
  | ZipraProductsTable
  | ProductTypesTable
  | ProductCategoriesTable
  | ProductImagesTable
  | ProductInventoryTable
  | ProductPricesTable
  | ProductRatingsTable
  | ProductReviewsTable
  | ProductVariantsTable
  | OrdersTable
  | OrderItemsTable
  | UserCartsTable
  | AiConversationsTable
  | AiMessagesTable
  | AiGeneratedContentTable
  | AiProductRecommendationsTable
  | AiUsageStatsTable
  | AiChatHistoryTable
  | OneTimePasswordsTable
  | OtpVerificationsTable
  | PendingRegistrationsTable
  | UserSessionsTable
  | UserDevicesTable
  | User2faTable
  | UserConnectedAppsTable
  | ZipraAppsTable
  | NotificationsTable
  | NotificationPreferencesTable
  | SystemHealthLogsTable
  | UserActivityLogsTable
  | UserActivityHistoryTable
  | UserAiInteractionsTable
  | UserDailyActivityTable
  | FileUploadsTable
  | AuditLogsTable;

// Helper type for partial updates
export type Updateable<T> = Partial<Omit<T, 'id' | 'created_at'>>;

// Helper type for table queries
export type QueryResult<T> = T | null;
export type QueryResults<T> = T[];
