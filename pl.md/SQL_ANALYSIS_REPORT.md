# SQL Schema Analysis Report

## Overview
- **File**: `SQL/public.sql`
- **Total Tables**: 280
- **Schema Type**: PostgreSQL (Supabase)
- **Status**: Currently running production database

---

## Table Categories & Counts

### 1. **Core User Management** (15 tables)
- `users` - Main user table
- `user_addresses` - User addresses
- `user_payment_methods` - Payment methods
- `user_sessions` - User sessions
- `user_devices` - Device management
- `user_2fa` - Two-factor authentication
- `user_security` - Security settings
- And 8 more...

### 2. **AI Services** (10 tables)
- `ai_conversations` - AI chat conversations
- `ai_messages` - Individual messages
- `ai_generated_content` - Generated content storage
- `ai_product_recommendations` - AI recommendations
- `ai_usage_stats` - Usage statistics
- `user_ai_interactions` - User AI interaction logs
- `user_ai_preferences` - AI preferences
- And 3 more...

### 3. **Products & E-commerce** (25 tables)
- `zipra_products` - Product catalog
- `product_types` - Product categorization
- `orders` / `order_items` - Order management
- `user_carts` - Shopping carts
- `user_purchases` - Purchase history
- `product_inventory` - Inventory tracking
- `product_prices` - Pricing
- And 18 more...

### 4. **Analytics & Tracking** (30 tables)
- `user_activity_logs` - Activity tracking
- `user_analytics` - User analytics
- `revenue_analytics` - Revenue tracking
- `system_health_logs` - System monitoring
- `api_usage_logs` - API usage
- And 25 more...

### 5. **Authentication & Security** (20 tables)
- `user_account_recovery_options` - Account recovery
- `user_security_questions` - Security questions
- `user_backup_codes` - Backup codes
- `captcha_challenges` - CAPTCHA
- And 16 more...

### 6. **Notifications & Communication** (15 tables)
- `user_notifications` - Notifications
- `user_notification_settings` - Preferences
- `user_push_tokens` - Push notification tokens
- `sms_queue` - SMS queue
- `whatsapp_queue` - WhatsApp
- And 10 more...

### 7. **Social & Community** (20 tables)
- `community_posts` - Community posts
- `community_comments` - Comments
- `community_likes` - Likes
- `user_follows` - Follow relationships
- `user_connections` - Connections
- And 15 more...

### 8. **Admin & Management** (15 tables)
- `admin_roles` - Admin roles
- `admin_users` - Admin users
- `audit_logs` - Audit trail
- `support_agents` - Support team
- And 11 more...

### 9. **Marketing & Engagement** (25 tables)
- `ad_campaigns` - Ad campaigns
- `affiliate_partners` - Affiliate program
- `affiliate_clicks` - Affiliate tracking
- `surveys` - Surveys
- And 21 more...

### 10. **Advanced Features** (105 tables)
- Various specialized tables for advanced functionality

---

## Key Tables with Column Details

### **users** (Main user table)
**Columns:**
- `id` uuid PRIMARY KEY
- `username` text UNIQUE
- `login_id` text UNIQUE  
- `password_hash` text
- `first_name` text
- `last_name` text
- `email` text UNIQUE
- `mobile` text
- `address` text
- `dob` date
- `gender` text (enum: Male, Female, Other, Prefer not to say)
- `is_email_verified` boolean
- `is_mobile_verified` boolean
- `account_status` text (enum: active, suspended, banned, deleted)
- `failed_login_attempts` integer
- `last_failed_login` timestamp
- `locked_until` timestamp
- `last_login_at` timestamp
- `created_at` timestamp
- `updated_at` timestamp
- Plus 30+ additional profile columns

### **zipra_products**
**Columns:**
- `id` uuid PRIMARY KEY
- `product_id` text UNIQUE
- `product_name` text
- `product_url` text
- `description` text
- `product_type` text
- `type_label` text
- `is_active` boolean
- `is_featured` boolean
- `display_order` integer
- And 20+ more columns

### **ai_conversations**
**Columns:**
- `id` uuid PRIMARY KEY
- `user_id` uuid FOREIGN KEY → users(id)
- `title` text
- `model` text
- `total_messages` integer
- `total_tokens` integer
- `is_pinned` boolean
- `is_archived` boolean
- `created_at` timestamp
- `updated_at` timestamp

---

## Enum Values Found

### Account Status
```sql
'active', 'suspended', 'banned', 'deleted'
```

### Gender
```sql
'Male', 'Female', 'Other', 'Prefer not to say'
```

### Campaign Types
```sql
'retarget', 'awareness', 'conversion', 'retention', 'win_back', 'lookalike'
```

### Offer Types
```sql
'discount', 'free_shipping', 'gift', 'early_access', 'none'
```

### Commission Types
```sql
'percent', 'fixed'
```

### Notification Types
```sql
'info', 'warning', 'error', 'success', 'alert'
```

### Priority Levels
```sql
'low', 'medium', 'high'
```

### Device Types
```sql
'mobile', 'desktop', 'tablet'
```

---

## Foreign Key Relationships

### Core User References
Most tables reference `users(id)` as the primary foreign key:
- `user_addresses.user_id` → `users.id`
- `user_payment_methods.user_id` → `users.id`
- `user_sessions.user_id` → `users.id`
- `user_devices.user_id` → `users.id`
- `ai_conversations.user_id` → `users.id`
- `orders.user_id` → `users.id`
- And 100+ more...

### Product References
- `order_items.product_id` → `zipra_products.product_id`
- `user_carts.product_id` → `zipra_products.product_id`
- `ai_product_recommendations.product_id` → `zipra_products.product_id`

### Hierarchical Relationships
- `admin_users.role_id` → `admin_roles.id`
- `admin_users.assigned_by` → `users.id`
- `ab_test_configs.created_by` → `users.id`
- `affiliate_clicks.affiliate_id` → `affiliate_partners.id`

---

## Primary Keys Pattern

All tables follow consistent patterns:
1. **UUID Primary Keys**: All tables use `uuid` type with `gen_random_uuid()` default
2. **Naming Convention**: `{table_name}_pkey`
3. **Composite Keys**: Some junction tables may have composite unique constraints

---

## Special Constraints

### CHECK Constraints
- Email format validation
- Username pattern: `^[a-z0-9._]{8,20}$`
- Login ID pattern: `^[a-z0-9._]+@prigod\.com$`
- Password hash length: exactly 64 characters (SHA-256)
- Date validations (e.g., DOB must be 16+ years ago)
- Enum value restrictions

### UNIQUE Constraints
- `users.username`
- `users.email`
- `users.login_id`
- `zipra_products.product_id`
- Various other business keys

---

## Indexes (Inferred from FK)

While explicit indexes aren't shown, foreign keys typically have indexes on:
- All `user_id` columns
- All `product_id` columns
- Timestamp columns used in sorting
- Status columns used in filtering

---

## Data Types Used

### Common Types
- `uuid` - Primary keys and foreign keys
- `text` - String data
- `boolean` - Flags
- `integer` - Counts
- `numeric(p,s)` - Monetary values
- `date` - Dates
- `timestamp with time zone` - Datetime
- `jsonb` - Structured data
- `inet` - IP addresses
- `ARRAY` - Array types

### JSONB Usage
Extensive use of JSONB for:
- Benefits, features, process steps
- Metadata
- Configuration
- Analytics data

---

## Missing Config Values Check

Based on current config files analysis (to be completed in STEP 2):

### ✅ Likely Covered
- Main user tables
- Product tables
- AI tables
- Order tables

### ⚠️ Potentially Missing (Need Verification)
Many specialized tables may not have config entries yet:
- Advanced analytics tables
- Social/community tables
- Marketing automation tables
- Crypto-related tables
- Video/voice communication tables

---

## Recommendations

1. **Add missing table names to `dbConfig.ts`**
2. **Create column constants for frequently used columns**
3. **Add enum type definitions in TypeScript**
4. **Document relationship patterns**
5. **Create index migration scripts**

---

*Report generated during STEP 1 of comprehensive project verification*
*Next: STEP 2 - Config Files Analysis*
