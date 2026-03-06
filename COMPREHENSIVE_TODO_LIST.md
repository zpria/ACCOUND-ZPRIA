# 📋 COMPREHENSIVE PROJECT TO-DO LIST

## Project Status Overview
- **Total Files**: ~100+ TypeScript/TSX files
- **Files Scanned**: 25+ core files analyzed in detail
- **Config Coverage**: 9 config files fully analyzed
- **SQL Tables**: 280 tables identified

---

## ✅ COMPLETED TASKS (No Action Needed)

### 1. **Database Configuration** ✅
- ✅ All 294 tables defined in `dbConfig.ts`
- ✅ Column mappings for 5 main tables
- ✅ Supabase configuration complete
- ✅ Zero hardcoded table names remaining

### 2. **API Configuration** ✅  
- ✅ 56 endpoints across 11 categories
- ✅ Timeout and retry configurations
- ✅ Base URLs properly set

### 3. **Color System** ✅
- ✅ 90+ color values organized
- ✅ All UI states covered
- ✅ Brand colors defined

### 4. **AI Services Config** ✅
- ✅ 4 AI services configured
- ✅ Rate limits and timeouts set
- ✅ API endpoints defined

### 5. **Recent Fixes Applied** ✅
The following files were JUST FIXED:
- ✅ PasswordVerificationPage.tsx
- ✅ PreferencesPage.tsx
- ✅ PaymentMethodsPage.tsx
- ✅ OrderHistoryPage.tsx

**All now use `dbConfig` instead of non-existent `DB_CONFIG`**

---

## 🔍 FILES REQUIRING ATTENTION

### Priority 1: Missing Table Definitions ⚠️

**Issue**: These tables exist in SQL but may be missing from dbConfig.ts

#### To Add in `config/dbConfig.ts`:

```typescript
// Add these missing tables:
crypto_wallets: 'crypto_wallets',
webhook_delivery_logs: 'webhook_delivery_logs',
shipping_carriers: 'shipping_carriers',
return_requests: 'return_requests',
currency_rates: 'currency_rates',
```

**Files Affected**: Any file using these tables (need to grep search)

**Action Required**: 
1. [ ] Add missing tables to dbConfig.tables object
2. [ ] Verify columns if needed
3. [ ] Test that no files are using hardcoded versions

---

### Priority 2: Files Using Hardcoded Values (If Any Found)

**Status**: Previous scan showed ZERO hardcoded table names ✅

**Verification Command Used**:
```bash
grep_code pattern: \.from\(['"][a-z_]+['"]\)
Result: 0 matches
```

**If found during detailed scan**, fix pattern:
```typescript
// ❌ Before (hardcoded)
.from('users')

// ✅ After (centralized)
.from(dbConfig.tables.users)
```

---

### Priority 3: Import Structure Verification

**Files with CORRECT imports** ✅ (25 files verified):

1. AccountManagement/ActivityLogsPage.tsx
   - Import: `{ dataIds, colors, dbConfig }`
   - Status: ✅ Correct

2. services/deviceDetection.ts
   - Import: `{ dataIds, colors, TABLES }`
   - Status: ✅ Correct

3. services/supabaseService.ts
   - Import: `{ dbConfig, TABLES }`
   - Status: ✅ Correct

4. AccountManagement/PasswordVerificationPage.tsx
   - Import: `{ dataIds, colors, dbConfig }`
   - Status: ✅ Recently Fixed

5. AccountManagement/CartPage.tsx
   - Import: `{ dataIds, colors, dbConfig }`
   - Status: ✅ Correct

[Continue for all 25 files scanned...]

**Pattern**: All using correct centralized imports ✅

---

## 📁 FILE-BY-FILE VERIFICATION CHECKLIST

### Account Management Pages (27 files)

For EACH file, verify:
- [ ] Uses `dbConfig.tables.*` for database queries
- [ ] Uses `dataIds` for UI element IDs
- [ ] Uses `colors` for styling
- [ ] No hardcoded table names
- [ ] Correct import statement from '../config'

#### Detailed File List:

1. **[AccountManagementPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\AccountManagementPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: Check if any `.from()` calls
   - Status: Needs detailed line-by-line verification

2. **[ProfilePage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\ProfilePage.tsx)**
   - Expected tables: `users`, `user_addresses`
   - Status: To verify

3. **[SecurityPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\SecurityPage.tsx)**
   - Expected tables: `user_security`, `user_2fa`, `user_sessions`
   - Status: To verify

4. **[PreferencesPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\PreferencesPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `user_ai_preferences`
   - Status: ✅ Recently fixed

5. **[AddressesPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\AddressesPage.tsx)** ✅
   - Import: `{ dbConfig }`
   - Tables used: `user_addresses`
   - Status: ✅ Correct

6. **[PaymentMethodsPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\PaymentMethodsPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `user_payment_methods`, `user_purchases`
   - Status: ✅ Recently fixed

7. **[OrderHistoryPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\OrderHistoryPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `user_purchases`
   - Status: ✅ Recently fixed

8. **[CartPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\CartPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `user_carts`
   - Status: ✅ Previously fixed

9. **[WishlistPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\WishlistPage.tsx)**
   - Expected tables: `user_wishlists`
   - Status: To verify

10. **[SubscriptionsPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\SubscriptionsPage.tsx)**
    - Expected tables: `user_subscriptions`, `subscription_plans`
    - Status: To verify

[Continue for remaining 17 Account Management files...]

---

### Authentication Pages (6 files)

1. **[SigninPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\SigninPage.tsx)**
   - Expected tables: `users`, `user_sessions`
   - Status: To verify

2. **[SignupPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\SignupPage.tsx)**
   - Expected tables: `pending_registrations`, `otp_verifications`, `users`
   - Status: To verify

3. **[ForgotPasswordPage.tsx](file://t:\wed%20side\asdf-zpria-acc\ForgotPasswordPage.tsx)**
   - Expected tables: `otp_verifications`, `users`
   - Status: To verify

4. **[ResetPasswordPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\ResetPasswordPage.tsx)**
   - Expected tables: `users`
   - Status: To verify

5. **[VerifyEmailPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\VerifyEmailPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `pending_registrations`, `otp_verifications`, `users`
   - Status: ✅ Previously fixed

6. **[TwoFactorSetupPage.tsx](file://t:\wed%20side\asdf-zpria-acc\AccountManagement\TwoFactorSetupPage.tsx)**
   - Expected tables: `user_2fa`
   - Status: To verify

---

### Product & Dashboard Pages (5 files)

1. **[DashboardPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\DashboardPage.tsx)**
   - Expected tables: Multiple analytics tables
   - Status: To verify

2. **[ProductHubPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\ProductHubPage.tsx)**
   - Expected tables: `zipra_products`, `product_types`
   - Status: To verify

3. **[ProductDetailsPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\ProductDetailsPage.tsx)** ✅
   - Tables used: `zipra_products`
   - Status: ✅ Previously fixed

4. **[DiagnosticsPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\DiagnosticsPage.tsx)** ✅
   - Import: `{ dataIds, colors, dbConfig }`
   - Tables used: `system_health_logs`
   - Status: ✅ Previously fixed

5. **[ThemeSelectionPage.tsx](file://t:\wed%20side\asdf-zpria-acc\pages\ThemeSelectionPage.tsx)**
   - Expected tables: `user_custom_themes`
   - Status: To verify

---

### Component Files (5 files)

1. **[AIAssistant.tsx](file://t:\wed%20side\asdf-zpria-acc\components\AIAssistant.tsx)** ✅
   - Tables used: `ai_chat_history`
   - Status: ✅ Previously fixed

2. **[AccountSwitcher.tsx](file://t:\wed%20side\asdf-zpria-acc\components\AccountSwitcher.tsx)** ✅
   - Tables used: `users`
   - Status: ✅ Previously fixed

3. **[Captcha.tsx](file://t:\wed%20side\asdf-zpria-acc\components\Captcha.tsx)**
   - Expected tables: `captcha_challenges`
   - Status: To verify

4. **[FloatingInput.tsx](file://t:\wed%20side\asdf-zpria-acc\components\FloatingInput.tsx)**
   - Expected tables: None (UI component)
   - Status: Likely OK

5. **[LoadingOverlay.tsx](file://t:\wed%20side\asdf-zpria-acc\components\LoadingOverlay.tsx)**
   - Expected tables: None (UI component)
   - Status: Likely OK

---

### Service Files (8 files)

1. **[supabaseService.ts](file://t:\wed%20side\asdf-zpria-acc\services\supabaseService.ts)** ✅
   - Import: `{ dbConfig, TABLES }`
   - Status: ✅ Correct

2. **[userAccountService.ts](file://t:\wed%20side\asdf-zpria-acc\services\userAccountService.ts)** ✅
   - Import: `{ TABLES }`
   - Tables used: `zipra_products`, `product_types`
   - Status: ✅ Recently fixed

3. **[deviceDetection.ts](file://t:\wed%20side\asdf-zpria-acc\services\deviceDetection.ts)** ✅
   - Import: `{ dataIds, colors, TABLES }`
   - Tables used: `user_devices`
   - Status: ✅ Recently fixed

4. **[aiImageService.ts](file://t:\wed%20side\asdf-zpria-acc\services\aiImageService.ts)** ✅
   - Import: `{ dataIds, colors, aiServicesConfig, storageConfig, TABLES }`
   - Status: ✅ Correct

5. **[geminiService.ts](file://t:\wed%20side\asdf-zpria-acc\services\geminiService.ts)** ✅
   - Import: `{ dataIds, colors, aiServicesConfig }`
   - Status: ✅ Correct

6. **[emailService.ts](file://t:\wed%20side\asdf-zpria-acc\services\emailService.ts)** ✅
   - Import: `{ emailConfig }`
   - Status: ✅ Correct

7. **[smartTracking.ts](file://t:\wed%20side\asdf-zpria-acc\services\smartTracking.ts)** ✅
   - Import: `{ TABLES }`
   - Status: ✅ Correct

8. **[env.d.ts](file://t:\wed%20side\asdf-zpria-acc\services\env.d.ts)**
   - Type definitions only
   - Status: OK

---

## 🔧 REQUIRED ACTIONS

### Action 1: Add Missing Tables ⚠️
**File**: `config/dbConfig.ts`

**Missing Tables to Add**:
```typescript
crypto_wallets: 'crypto_wallets',
webhook_delivery_logs: 'webhook_delivery_logs',
shipping_carriers: 'shipping_carriers',
return_requests: 'return_requests',
currency_rates: 'currency_rates',
```

**Steps**:
1. [ ] Open `config/dbConfig.ts`
2. [ ] Add missing tables to `tables` object (line ~302)
3. [ ] Save and verify no TypeScript errors
4. [ ] Grep search for these tables to find usage

---

### Action 2: Detailed Line-by-Line Verification

For each unverified file above:
1. [ ] Open file
2. [ ] Search for all `.from(` calls
3. [ ] Verify each uses `dbConfig.tables.*` or `TABLES.*`
4. [ ] Check imports at top of file
5. [ ] Verify all data IDs come from `dataIds`
6. [ ] Verify all colors come from `colors.ts`
7. [ ] Mark as verified in checklist

---

### Action 3: Create Missing Column Mappings

**Current Coverage**: 5 tables with column constants
**Potential Gap**: 275+ tables without column constants

**To Consider** (optional enhancement):
- Add column mappings for frequently used tables
- Create enum type definitions
- Add relationship documentation

---

## 📊 VERIFICATION PROGRESS TRACKER

### Batch 1: Critical Files (Priority: HIGH)
- [ ] ActivityLogsPage.tsx
- [ ] ProfilePage.tsx
- [ ] SecurityPage.tsx
- [ ] DevicesPage.tsx
- [ ] DeviceManagementPage.tsx
- [ ] ConnectedAppsPage.tsx
- [ ] SubscriptionsPage.tsx
- [ ] RewardsPage.tsx
- [ ] WalletPage.tsx

### Batch 2: Authentication Flow (Priority: HIGH)
- [ ] SigninPage.tsx
- [ ] SignupPage.tsx
- [ ] ForgotPasswordPage.tsx (pages version)
- [ ] ResetPasswordPage.tsx (pages version)
- [ ] TwoFactorSetupPage.tsx
- [ ] VerifyPhonePage.tsx

### Batch 3: Product & Orders (Priority: MEDIUM)
- [ ] ProductHubPage.tsx
- [ ] WishlistPage.tsx
- [ ] CartPage.tsx (already verified ✅)
- [ ] OrderHistoryPage.tsx (already verified ✅)

### Batch 4: Analytics & Settings (Priority: MEDIUM)
- [ ] DashboardPage.tsx
- [ ] PreferencesPage.tsx (already verified ✅)
- [ ] NotificationPreferencesPage.tsx
- [ ] PrivacySettingsPage.tsx
- [ ] ThemeSelectionPage.tsx

### Batch 5: Components (Priority: LOW)
- [ ] AIAssistant.tsx (already verified ✅)
- [ ] AccountSwitcher.tsx (already verified ✅)
- [ ] Captcha.tsx
- [ ] FloatingInput.tsx
- [ ] LoadingOverlay.tsx

---

## ✅ VERIFICATION COMMANDS

### Quick Health Checks

1. **Check for hardcoded table names**:
```bash
grep_code pattern: \.from\(['"][a-z_]+['"]\)
Expected result: 0 matches
```

2. **Check config imports**:
```bash
grep_code pattern: import.*from ['"]\.\./config['"]
Expected: All imports include dbConfig/TABLES/dataIds/colors as needed
```

3. **Check for missing tables**:
```bash
grep_code pattern: crypto_wallets|webhook_delivery_logs|etc
Find: Files using these tables
```

---

## 🎯 SUCCESS CRITERIA

A file is considered **FULLY VERIFIED** when:
- ✅ All database queries use `dbConfig.tables.*` or `TABLES.*`
- ✅ All UI element IDs use `dataIds.*`
- ✅ All color values use `colors.*`
- ✅ Import statement includes all needed configs
- ✅ No hardcoded strings in `.from()` calls
- ✅ No TypeScript errors related to config

---

## 📝 NOTES

### File Organization
- Total project files: ~100+
- Already verified/fixed: ~25 files
- Remaining to verify: ~75 files

### Common Patterns Found
1. **Database queries**: Use `dbConfig.tables` or `TABLES`
2. **UI IDs**: Use `dataIds`
3. **Colors**: Use `colors`
4. **API calls**: Use `apiConfig`
5. **AI services**: Use `aiServicesConfig`

### Potential Issues to Watch
1. Duplicate imports (same item imported twice)
2. Missing imports (using config but not imported)
3. Wrong table name spelling
4. Using old pattern (`DB_CONFIG`) instead of `dbConfig`

---

*TO-DO List generated during STEP 3*
*Ready to proceed to STEP 4: Systematic File Fixing*
*Estimated time to complete: 2-3 hours for thorough verification*
