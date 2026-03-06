-- ============================================================================
-- ROLLBACK 001: Initial Schema Rollback
-- Description: Drops all tables created in migration 001
-- Date: 2026-03-06
-- Author: Database Team
-- WARNING: This will delete all data! Use with caution.
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- DROP TABLES IN CORRECT ORDER (respecting foreign keys)
-- ============================================================================

-- Drop AI tables
DROP TABLE IF EXISTS ai_messages CASCADE;
DROP TABLE IF EXISTS ai_conversations CASCADE;
DROP TABLE IF EXISTS ai_chat_history CASCADE;

-- Drop order tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS user_carts CASCADE;

-- Drop product tables
DROP TABLE IF EXISTS zipra_products CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;

-- Drop authentication tables
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS pending_registrations CASCADE;

-- Drop user-related tables
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS user_payment_methods CASCADE;

-- Drop core users table last
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- DROP INDEXES (will be automatically dropped with CASCADE, but listed for completeness)
-- ============================================================================

-- Note: All indexes are automatically dropped when tables are dropped with CASCADE
-- The following is for documentation purposes only

-- User indexes (automatically dropped)
-- idx_users_username
-- idx_users_email
-- idx_users_login_id
-- idx_users_account_status
-- idx_users_created_at

-- Address indexes (automatically dropped)
-- idx_user_addresses_user_id
-- idx_user_addresses_is_default

-- Product indexes (automatically dropped)
-- idx_zipra_products_product_id
-- idx_zipra_products_is_active
-- idx_zipra_products_display_order

-- Order indexes (automatically dropped)
-- idx_orders_user_id
-- idx_orders_order_number
-- idx_orders_status
-- idx_orders_created_at

-- AI indexes (automatically dropped)
-- idx_ai_conversations_user_id
-- idx_ai_messages_conversation_id
-- idx_ai_chat_history_user_id

-- Auth indexes (automatically dropped)
-- idx_otp_verifications_email
-- idx_otp_verifications_expires_at
-- idx_user_sessions_user_id
-- idx_user_sessions_token
-- idx_user_devices_user_id

-- Commit transaction
COMMIT;

-- ============================================================================
-- END OF ROLLBACK 001
-- ============================================================================
