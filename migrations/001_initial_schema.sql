-- ============================================================================
-- MIGRATION 001: Initial Schema Consolidation
-- Description: Creates all core tables from public.sql schema
-- Date: 2026-03-06
-- Author: Database Team
-- Version: 1.0.0
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- CORE USER TABLES
-- ============================================================================

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9._]{8,20}$'::text),
  login_id text NOT NULL UNIQUE CHECK (login_id ~* '^[a-z0-9._]+@prigod\.com$'::text),
  password_hash text NOT NULL CHECK (length(password_hash) = 64),
  first_name text NOT NULL CHECK (length(first_name) >= 2),
  last_name text NOT NULL CHECK (length(last_name) >= 2),
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  mobile text CHECK (mobile IS NULL OR mobile ~ '^\+[1-9]\d{1,14}$'::text),
  address text NOT NULL CHECK (length(address) >= 10),
  dob date NOT NULL CHECK (dob <= (CURRENT_DATE - '16 years'::interval)),
  gender text NOT NULL CHECK (gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Other'::text, 'Prefer not to say'::text])),
  is_email_verified boolean NOT NULL DEFAULT false,
  is_mobile_verified boolean NOT NULL DEFAULT false,
  account_status text NOT NULL DEFAULT 'active'::text CHECK (account_status = ANY (ARRAY['active'::text, 'suspended'::text, 'banned'::text, 'deleted'::text])),
  failed_login_attempts integer NOT NULL DEFAULT 0,
  last_failed_login timestamp with time zone,
  locked_until timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  auth_user_id uuid,
  avatar_url text,
  cover_photo_url text,
  bio text,
  marital_status text CHECK (marital_status IS NULL OR (marital_status = ANY (ARRAY['single'::text, 'married'::text, 'divorced'::text, 'widowed'::text, 'prefer_not_to_say'::text]))),
  has_children boolean DEFAULT false,
  education text,
  occupation text,
  company_name text,
  industry text,
  monthly_income_range text,
  religion text,
  lifestyle text,
  country text,
  city text,
  area text,
  postal_code text,
  referral_source text,
  referred_by uuid,
  middle_name text,
  name_pronunciation text,
  pronouns text,
  custom_pronouns text,
  profile_url text,
  website_url text,
  profile_completion_percent integer DEFAULT 0,
  is_verified_user boolean DEFAULT false,
  verified_at timestamp with time zone,
  verification_badge_type text,
  account_type text DEFAULT 'personal'::text,
  PRIMARY KEY (id)
);

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label text CHECK (label IS NULL OR (label = ANY (ARRAY['Home'::text, 'Work'::text, 'Other'::text]))),
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  area text,
  postal_code text,
  country text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  is_commercial boolean NOT NULL DEFAULT false,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  delivery_instructions text,
  gate_code text,
  building_name text,
  floor_number text,
  apartment_number text,
  landmark text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- User payment methods
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type = ANY (ARRAY['card'::text, 'bank'::text, 'wallet'::text, 'crypto'::text])),
  provider text NOT NULL,
  masked_number text NOT NULL,
  expiry_month integer,
  expiry_year integer,
  is_default boolean NOT NULL DEFAULT false,
  billing_address text,
  cardholder_name text,
  nickname text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- ============================================================================
-- PRODUCT TABLES
-- ============================================================================

-- Products
CREATE TABLE IF NOT EXISTS zipra_products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id text NOT NULL UNIQUE,
  product_name text NOT NULL,
  product_url text NOT NULL,
  description text NOT NULL,
  long_description text,
  product_type text NOT NULL,
  type_label text NOT NULL,
  benefits jsonb,
  features jsonb,
  process_steps jsonb,
  setup_guide jsonb,
  tags text NOT NULL,
  requirements text,
  documentation_url text,
  support_url text,
  icon_url text,
  banner_url text,
  screenshot_urls jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  target_audience text,
  pricing_type text CHECK (pricing_type IS NULL OR (pricing_type = ANY (ARRAY['free'::text, 'freemium'::text, 'paid'::text, 'subscription'::text]))),
  price numeric(10, 2),
  currency text DEFAULT 'USD'::text,
  version text,
  total_users integer DEFAULT 0,
  rating numeric(3, 2),
  review_count integer DEFAULT 0,
  meta_title text,
  meta_description text,
  keywords text,
  launched_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Product types
CREATE TABLE IF NOT EXISTS product_types (
  type_id text NOT NULL UNIQUE,
  type_name text NOT NULL,
  type_description text,
  type_icon text,
  type_question text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (type_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text])),
  total_amount numeric(12, 2) NOT NULL,
  subtotal numeric(12, 2) NOT NULL,
  tax_amount numeric(12, 2) NOT NULL DEFAULT 0,
  shipping_cost numeric(12, 2) NOT NULL DEFAULT 0,
  discount_amount numeric(12, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD'::text,
  payment_method text,
  payment_status text NOT NULL CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  shipping_address text,
  billing_address text,
  tracking_number text,
  carrier text,
  estimated_delivery timestamp with time zone,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12, 2) NOT NULL,
  total_price numeric(12, 2) NOT NULL,
  discount numeric(12, 2) DEFAULT 0,
  tax numeric(12, 2) DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- User carts
CREATE TABLE IF NOT EXISTS user_carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  max_quantity integer DEFAULT 10,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- ============================================================================
-- AI TABLES
-- ============================================================================

-- AI conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  model text NOT NULL,
  total_messages integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  is_pinned boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- AI messages
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  model_used text,
  is_liked boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- ============================================================================
-- AUTHENTICATION & SECURITY TABLES
-- ============================================================================

-- OTP verifications
CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_code text NOT NULL,
  purpose text NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Pending registrations
CREATE TABLE IF NOT EXISTS pending_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL,
  login_id text NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  dob date NOT NULL,
  gender text NOT NULL,
  address text NOT NULL,
  country text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  PRIMARY KEY (id)
);

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  device_id uuid,
  ip_address text,
  user_agent text,
  is_current boolean NOT NULL DEFAULT false,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- User devices
CREATE TABLE IF NOT EXISTS user_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_name text NOT NULL,
  device_type text NOT NULL CHECK (device_type = ANY (ARRAY['mobile'::text, 'desktop'::text, 'tablet'::text])),
  browser text NOT NULL,
  os text NOT NULL,
  ip_address text,
  location text,
  is_trusted boolean NOT NULL DEFAULT false,
  is_current boolean NOT NULL DEFAULT false,
  last_used_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_login_id ON users(login_id);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Address indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_zipra_products_product_id ON zipra_products(product_id);
CREATE INDEX IF NOT EXISTS idx_zipra_products_is_active ON zipra_products(is_active);
CREATE INDEX IF NOT EXISTS idx_zipra_products_display_order ON zipra_products(display_order);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- AI indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);

-- Auth indexes
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);

-- Commit transaction
COMMIT;

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================
