-- Enhanced Account Management Tables Migration
-- Adding missing tables for complete account management system

-- Create user_audit_logs table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS public.user_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT user_audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_backup_codes table for account recovery
CREATE TABLE IF NOT EXISTS public.user_backup_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  backup_code_hash text NOT NULL,
  is_used boolean DEFAULT false,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_backup_codes_pkey PRIMARY KEY (id),
  CONSTRAINT user_backup_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_account_recovery table for account recovery options
CREATE TABLE IF NOT EXISTS public.user_account_recovery (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recovery_type text NOT NULL CHECK (recovery_type = ANY (ARRAY['email'::text, 'phone'::text, 'backup_contact'::text, 'security_question'::text])),
  recovery_value text,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_account_recovery_pkey PRIMARY KEY (id),
  CONSTRAINT user_account_recovery_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_security_questions table for additional authentication
CREATE TABLE IF NOT EXISTS public.user_security_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question text NOT NULL,
  answer_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_security_questions_pkey PRIMARY KEY (id),
  CONSTRAINT user_security_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_trusted_devices table for trusted device management
CREATE TABLE IF NOT EXISTS public.user_trusted_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid,
  device_name text,
  device_type text,
  os text,
  browser text,
  fingerprint text,
  ip_address inet,
  is_trusted boolean DEFAULT true,
  trusted_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  CONSTRAINT user_trusted_devices_pkey PRIMARY KEY (id),
  CONSTRAINT user_trusted_devices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_session_preferences table for session-specific settings
CREATE TABLE IF NOT EXISTS public.user_session_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT user_session_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_session_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create user_account_history table for tracking account changes
CREATE TABLE IF NOT EXISTS public.user_account_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  change_type text NOT NULL CHECK (change_type = ANY (ARRAY['profile_update'::text, 'security_change'::text, 'privacy_change'::text, 'account_recovery'::text, 'subscription_change'::text, 'payment_method_change'::text])),
  description text,
  old_value text,
  new_value text,
  ip_address inet,
  user_agent text,
  changed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_account_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_account_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_user_id ON public.user_audit_logs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_audit_logs_created_at ON public.user_audit_logs USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_user_backup_codes_user_id ON public.user_backup_codes USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_backup_codes_is_used ON public.user_backup_codes USING btree (is_used);
CREATE INDEX IF NOT EXISTS idx_user_account_recovery_user_id ON public.user_account_recovery USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_questions_user_id ON public.user_security_questions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_trusted_devices_user_id ON public.user_trusted_devices USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_account_history_user_id ON public.user_account_history USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_account_history_change_type ON public.user_account_history USING btree (change_type);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_account_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_session_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_account_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new tables
CREATE POLICY "Users can view own audit logs" ON public.user_audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own audit logs" ON public.user_audit_logs FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own backup codes" ON public.user_backup_codes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own backup codes" ON public.user_backup_codes FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own account recovery options" ON public.user_account_recovery FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own account recovery options" ON public.user_account_recovery FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own account recovery options" ON public.user_account_recovery FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own security questions" ON public.user_security_questions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own security questions" ON public.user_security_questions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own security questions" ON public.user_security_questions FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own trusted devices" ON public.user_trusted_devices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own trusted devices" ON public.user_trusted_devices FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trusted devices" ON public.user_trusted_devices FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own trusted devices" ON public.user_trusted_devices FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view own session preferences" ON public.user_session_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own session preferences" ON public.user_session_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own session preferences" ON public.user_session_preferences FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own account history" ON public.user_account_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own account history" ON public.user_account_history FOR INSERT WITH CHECK (user_id = auth.uid());