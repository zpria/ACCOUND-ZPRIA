# Account Management System

This folder contains all the account management related pages for the ZPRIA platform, organized in a centralized location similar to Google's My Account system.

## Overview

The account management system provides users with a comprehensive dashboard to manage all aspects of their account, including profile information, security settings, privacy controls, payment methods, and more.

## Page Structure

### Main Account Pages
- `AccountDashboardPage.tsx` - Main dashboard showing account overview and quick access to all account features
- `AccountServicesPage.tsx` - Central hub for accessing all account management tools

### Profile Management
- `ProfilePage.tsx` - Comprehensive profile management with personal information, contact details, and preferences

### Security Settings
- `SecuritySettingsPage.tsx` - Password management, security questions, and account security
- `TwoFactorSetupPage.tsx` - Two-factor authentication setup and management
- `DevicesPage.tsx` - Active sessions and device management
- `DeviceManagementPage.tsx` - Detailed device management features

### Privacy Settings
- `PrivacySettingsPage.tsx` - Privacy controls and data management preferences

### Notifications
- `NotificationPreferencesPage.tsx` - Email, SMS, and push notification preferences

### Payments & Finance
- `PaymentMethodsPage.tsx` - Payment method management
- `WalletPage.tsx` - Digital wallet and balance management
- `OrderHistoryPage.tsx` - Purchase and order history
- `SubscriptionsPage.tsx` - Subscription management

### Account Connections
- `ConnectedAppsPage.tsx` - Third-party app connections and permissions

### Activity & History
- `ActivityLogsPage.tsx` - Account activity and login history

### Shopping Features
- `WishlistPage.tsx` - Saved items and wishlists
- `CartPage.tsx` - Shopping cart management
- `AddressesPage.tsx` - Address book management
- `RewardsPage.tsx` - Loyalty rewards and points

### Additional Settings
- `PreferencesPage.tsx` - General account preferences and settings

### Authentication Related
- `ForgotPasswordPage.tsx` - Password recovery flow
- `ResetPasswordPage.tsx` - Password reset functionality
- `VerifyEmailPage.tsx` - Email verification process
- `VerifyPhonePage.tsx` - Phone number verification process

## Navigation Structure

All account management pages are accessible through the main account dashboard, providing a unified experience similar to Google's My Account system. Users can easily navigate between different account management sections without losing context.

## Routing

The account management pages are integrated into the main application routing system through App.tsx, with routes structured as:
- `/account` - Main account dashboard
- `/account/profile` - Profile management
- `/account/security` - Security settings
- `/account/privacy` - Privacy settings
- `/account/notifications` - Notification preferences
- `/account/payments` - Payment methods
- `/account/orders` - Order history
- And more specific routes for each feature

This structure ensures all account management tools are properly connected and accessible from a central location.