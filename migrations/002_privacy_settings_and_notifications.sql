-- ============================================================================
-- MIGRATION 002: Privacy Settings and User Notification Columns
-- Description: Adds user_privacy_settings table and notification columns to users
-- Date: 2026-03-07
-- Author: Database Team
-- Version: 1.1.0
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- CREATE USER_PRIVACY_SETTINGS TABLE IF NOT EXISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  analytics_consent boolean DEFAULT true,
  marketing_consent boolean DEFAULT false,
  personalization_consent boolean DEFAULT true,
  third_party_sharing boolean DEFAULT false,
  cookie_consent boolean DEFAULT true,
  data_retention_years integer DEFAULT 5,
  consented_at timestamp with time zone DEFAULT now(),
  last_updated timestamp with time zone DEFAULT now(),
  profile_search_visibility boolean DEFAULT true,
  show_online_status boolean DEFAULT true,
  show_last_seen boolean DEFAULT true,
  show_read_receipts boolean DEFAULT true,
  allow_friend_requests boolean DEFAULT true,
  allow_message_from text DEFAULT 'everyone'::text,
  allow_tag_from text DEFAULT 'friends'::text,
  discoverable_by_email boolean DEFAULT false,
  discoverable_by_phone boolean DEFAULT false,
  hide_from_search_engines boolean DEFAULT false,
  face_recognition_enabled boolean DEFAULT false,
  location_sharing_enabled boolean DEFAULT false,
  location_sharing_with text DEFAULT 'none'::text,
  sensitive_content_filter boolean DEFAULT true,
  ai_data_training_consent boolean DEFAULT false,
  cross_app_tracking boolean DEFAULT false,
  personalized_ads boolean DEFAULT true,
  data_retention_preference text DEFAULT 'standard'::text,
  auto_delete_activity_after_months integer DEFAULT 0,
  serial_id text,
  username text,
  
  -- NEW COLUMNS FROM YOUR REQUEST
  updated_at timestamp with time zone DEFAULT now(),
  profile_visibility text DEFAULT 'public'::text,
  show_email boolean DEFAULT false,
  show_phone boolean DEFAULT false,
  allow_search_by_email boolean DEFAULT false,
  allow_search_by_phone boolean DEFAULT false,
  
  CONSTRAINT user_privacy_settings_pkey PRIMARY KEY (id),
  CONSTRAINT user_privacy_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ============================================================================
-- ADD MISSING COLUMNS TO user_privacy_settings (for existing tables)
-- ============================================================================

-- Add updated_at column if not exists (separate statement for existing tables)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Add profile_visibility column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'profile_visibility'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN profile_visibility text DEFAULT 'public'::text;
  END IF;
END $$;

-- Add show_email column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'show_email'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN show_email boolean DEFAULT false;
  END IF;
END $$;

-- Add show_phone column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'show_phone'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN show_phone boolean DEFAULT false;
  END IF;
END $$;

-- Add allow_search_by_email column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'allow_search_by_email'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN allow_search_by_email boolean DEFAULT false;
  END IF;
END $$;

-- Add allow_search_by_phone column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_privacy_settings' 
      AND column_name = 'allow_search_by_phone'
  ) THEN
    ALTER TABLE public.user_privacy_settings 
    ADD COLUMN allow_search_by_phone boolean DEFAULT false;
  END IF;
END $$;

-- ============================================================================
-- ADD LOGIN NOTIFICATION COLUMNS TO USERS TABLE
-- ============================================================================

-- Add login_notify_every_login column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'login_notify_every_login'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN login_notify_every_login boolean DEFAULT true;
  END IF;
END $$;

-- Add login_notify_new_device_only column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'login_notify_new_device_only'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN login_notify_new_device_only boolean DEFAULT false;
  END IF;
END $$;

-- Add login_notify_via_email column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'login_notify_via_email'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN login_notify_via_email boolean DEFAULT true;
  END IF;
END $$;

-- Add login_notify_via_sms column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'login_notify_via_sms'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN login_notify_via_sms boolean DEFAULT false;
  END IF;
END $$;

-- Add login_notify_via_push column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'login_notify_via_push'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN login_notify_via_push boolean DEFAULT true;
  END IF;
END $$;

-- Add password_change_notify column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'password_change_notify'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN password_change_notify boolean DEFAULT true;
  END IF;
END $$;

-- Add email_change_notify column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'email_change_notify'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN email_change_notify boolean DEFAULT true;
  END IF;
END $$;

-- Add phone_change_notify column
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'phone_change_notify'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN phone_change_notify boolean DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Index for privacy settings
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON public.user_privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_updated_at ON public.user_privacy_settings(updated_at);

-- Index for user notification settings
CREATE INDEX IF NOT EXISTS idx_users_login_notify ON public.users(login_notify_every_login, login_notify_new_device_only);
CREATE INDEX IF NOT EXISTS idx_users_security_notify ON public.users(password_change_notify, email_change_notify, phone_change_notify);

-- ============================================================================
-- UPDATE EXISTING ROWS WITH DEFAULT VALUES (Optional)
-- ============================================================================

-- Update existing privacy settings with default values for new columns
UPDATE public.user_privacy_settings 
SET 
  updated_at = COALESCE(last_updated, now()),
  profile_visibility = COALESCE(profile_visibility, 'public'::text),
  show_email = COALESCE(show_email, false),
  show_phone = COALESCE(show_phone, false),
  allow_search_by_email = COALESCE(allow_search_by_email, false),
  allow_search_by_phone = COALESCE(allow_search_by_phone, false)
WHERE updated_at IS NULL OR profile_visibility IS NULL;

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run these separately after migration)
-- ============================================================================

-- Verify all columns exist (run this after migration)
-- SELECT 
--   'user_privacy_settings' as table_name,
--   COUNT(*) as column_count
-- FROM information_schema.columns 
-- WHERE table_name = 'user_privacy_settings' 
--   AND column_name IN ('updated_at', 'profile_visibility', 'show_email', 'show_phone', 'allow_search_by_email', 'allow_search_by_phone')
-- UNION ALL
-- SELECT 
--   'users' as table_name,
--   COUNT(*) as column_count
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
--   AND column_name IN ('login_notify_every_login', 'login_notify_new_device_only', 'login_notify_via_email', 'login_notify_via_sms', 'login_notify_via_push', 'password_change_notify', 'email_change_notify', 'phone_change_notify');

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================
