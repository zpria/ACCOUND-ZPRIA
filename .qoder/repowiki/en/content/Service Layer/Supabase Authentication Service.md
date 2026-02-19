# Supabase Authentication Service

<cite>
**Referenced Files in This Document**
- [supabaseService.ts](file://services/supabaseService.ts)
- [SigninPage.tsx](file://pages/SigninPage.tsx)
- [emailService.ts](file://services/emailService.ts)
- [types.ts](file://types.ts)
- [constants.tsx](file://constants.tsx)
- [package.json](file://package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive documentation for the Supabase authentication service integration. It covers client initialization, password hashing with SHA-256, user availability checking, sophisticated login attempt handling with lockout protection, multi-field user lookup, authentication flow, error handling strategies, and security measures. Practical examples demonstrate password hashing, user validation, and login processing, along with database schema assumptions, query patterns, and performance considerations.

## Project Structure
The authentication system spans several key files:
- Supabase client initialization and authentication utilities
- Sign-in page with two-step authentication flow
- Email service for security notifications
- Type definitions for user profiles and authentication state
- Constants for branding and configuration

```mermaid
graph TB
subgraph "Authentication Layer"
Svc["Supabase Service<br/>supabaseService.ts"]
Types["Types<br/>types.ts"]
Email["Email Service<br/>emailService.ts"]
end
subgraph "UI Layer"
SignIn["Signin Page<br/>SigninPage.tsx"]
Consts["Constants<br/>constants.tsx"]
end
subgraph "External Dependencies"
SupabaseJS["@supabase/supabase-js<br/>package.json"]
end
SignIn --> Svc
Svc --> SupabaseJS
Svc --> Types
SignIn --> Email
Email --> Consts
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L1-L67)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L1-L231)
- [emailService.ts](file://services/emailService.ts#L1-L194)
- [types.ts](file://types.ts#L1-L79)
- [constants.tsx](file://constants.tsx#L1-L361)
- [package.json](file://package.json#L12-L18)

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L1-L67)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L1-L231)
- [emailService.ts](file://services/emailService.ts#L1-L194)
- [types.ts](file://types.ts#L1-L79)
- [constants.tsx](file://constants.tsx#L1-L361)
- [package.json](file://package.json#L12-L18)

## Core Components
- Supabase client initialization with URL and API key
- Password hashing using SHA-256
- User availability checking for username and email
- Multi-field user lookup (username, login_id, mobile, email)
- Login attempt handling with lockout protection and failed attempt tracking
- Authentication flow with error handling and security notifications

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L4-L15)
- [supabaseService.ts](file://services/supabaseService.ts#L17-L24)
- [supabaseService.ts](file://services/supabaseService.ts#L26-L66)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L23-L51)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L53-L95)
- [emailService.ts](file://services/emailService.ts#L152-L172)

## Architecture Overview
The authentication architecture follows a layered approach:
- UI layer handles user input and displays feedback
- Service layer encapsulates Supabase operations and security logic
- Email service provides security notifications
- Type definitions ensure consistent data structures

```mermaid
sequenceDiagram
participant UI as "SigninPage.tsx"
participant Svc as "supabaseService.ts"
participant Supabase as "Supabase Client"
participant Email as "emailService.ts"
UI->>Svc : "hashPassword(password)"
Svc-->>UI : "hashedPassword"
UI->>Svc : "handleLoginAttempt(identifier, hashedPassword)"
Svc->>Supabase : "lookup user by username, login_id, mobile, or email"
Supabase-->>Svc : "user record"
Svc->>Svc : "check lockout status"
alt "valid credentials"
Svc->>Supabase : "reset failed attempts and update last_login"
Svc-->>UI : "user profile"
UI->>Email : "sendWelcomeAlert()"
Email-->>UI : "confirmation"
else "invalid credentials"
Svc->>Supabase : "increment failed attempts"
alt "exceeded attempts"
Svc->>Supabase : "set locked_until"
end
Svc-->>UI : "error message"
end
```

**Diagram sources**
- [SigninPage.tsx](file://pages/SigninPage.tsx#L53-L95)
- [supabaseService.ts](file://services/supabaseService.ts#L26-L66)
- [emailService.ts](file://services/emailService.ts#L152-L172)

## Detailed Component Analysis

### Supabase Client Initialization
The Supabase client is initialized with a predefined URL and anonymous key. This creates a singleton client instance used throughout the application for database operations.

Key characteristics:
- Uses @supabase/supabase-js library
- Static configuration for URL and API key
- Exported client instance for reuse

Implementation highlights:
- Client creation with URL and key
- Exported client for database operations

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L2-L7)
- [package.json](file://package.json#L17-L17)

### Password Hashing Implementation (SHA-256)
Password hashing uses the Web Crypto API to compute SHA-256 hashes:
- Trims whitespace from input to prevent hidden space issues
- Encodes password to UTF-8 bytes
- Computes SHA-256 digest
- Converts buffer to hexadecimal string

Security considerations:
- Pre-trimming prevents hidden whitespace attacks
- SHA-256 provides cryptographic hashing
- No salt is applied in this implementation

```mermaid
flowchart TD
Start(["hashPassword(password)"]) --> Trim["Trim password"]
Trim --> Encode["Encode to UTF-8 bytes"]
Encode --> Digest["Compute SHA-256 digest"]
Digest --> Buffer["Convert to hex string"]
Buffer --> End(["Return hash"])
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L9-L15)

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L9-L15)

### User Availability Checking
The availability checker validates whether a username or email is already taken:
- Normalizes input to lowercase and trims whitespace
- Checks against users table for existing records
- Also checks pending_registrations table
- Returns boolean indicating availability

```mermaid
flowchart TD
Start(["checkAvailability(field, value)"]) --> Normalize["Normalize value (lowercase, trim)"]
Normalize --> CheckUsers["Query users table"]
CheckUsers --> FoundUsers{"User exists?"}
FoundUsers --> |Yes| ReturnFalse["Return false"]
FoundUsers --> |No| CheckPending["Query pending_registrations table"]
CheckPending --> FoundPending{"Pending exists?"}
FoundPending --> |Yes| ReturnFalse2["Return false"]
FoundPending --> |No| ReturnTrue["Return true"]
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L17-L24)

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L17-L24)

### Multi-Field User Lookup System
The system supports flexible user identification across four fields:
- Username
- Login ID
- Mobile number
- Email address

Lookup mechanism:
- Uses Supabase OR conditions in a single query
- Normalizes identifiers to lowercase for case-insensitive matching
- Returns the first matching record or null

```mermaid
flowchart TD
Start(["Multi-field Lookup"]) --> Normalize["Normalize identifier"]
Normalize --> Query["SELECT * FROM users WHERE<br/>username|login_id|mobile|email = identifier"]
Query --> Result{"Match found?"}
Result --> |Yes| ReturnUser["Return user record"]
Result --> |No| ReturnNull["Return null"]
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L29-L34)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L32-L36)

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L29-L34)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L32-L36)

### Login Attempt Handling System
The login attempt handler implements robust security controls:
- Multi-field user lookup
- Lockout status validation
- Credential verification
- Failed attempt tracking
- Automatic lockout enforcement

Security protocols:
- Lockout timer: 15 minutes after 5 failed attempts
- Attempt reset on successful login
- Graceful error messaging with remaining attempts

```mermaid
flowchart TD
Start(["handleLoginAttempt(identifier, passwordHash)"]) --> Normalize["Normalize identifier"]
Normalize --> Lookup["Find user by multi-field lookup"]
Lookup --> UserFound{"User found?"}
UserFound --> |No| ThrowNotFound["Throw 'Account not found'"]
UserFound --> |Yes| CheckLockout["Check locked_until"]
CheckLockout --> Locked{"Locked out?"}
Locked --> |Yes| ThrowLocked["Throw lockout error"]
Locked --> |No| Verify["Compare password_hash"]
Verify --> Match{"Match?"}
Match --> |Yes| ResetAttempts["Reset failed attempts and update last_login"]
ResetAttempts --> ReturnUser["Return user"]
Match --> |No| Increment["Increment failed attempts"]
Increment --> Exceeded{"Attempts >= 5?"}
Exceeded --> |Yes| SetLockout["Set locked_until = now + 15 min"]
SetLockout --> ThrowExceeded["Throw security lockout"]
Exceeded --> |No| UpdateAttempts["Update failed attempts"]
UpdateAttempts --> ThrowRemaining["Throw invalid credentials with remaining attempts"]
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L26-L66)

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L26-L66)

### Authentication Flow
The authentication flow follows a two-step process:
1. Identifier verification step
2. Password verification step

```mermaid
sequenceDiagram
participant User as "User"
participant SignIn as "SigninPage"
participant Svc as "Supabase Service"
participant DB as "Supabase Database"
User->>SignIn : "Enter identifier"
SignIn->>DB : "Lookup user by identifier"
DB-->>SignIn : "User found or not found"
alt "User found"
SignIn->>User : "Show password field"
User->>SignIn : "Enter password"
SignIn->>Svc : "Hash password"
Svc-->>SignIn : "Hashed password"
SignIn->>Svc : "Verify credentials"
Svc->>DB : "Check attempts and lockout"
DB-->>Svc : "User record"
alt "Valid credentials"
Svc->>DB : "Reset attempts and update last_login"
Svc-->>SignIn : "Success"
SignIn->>User : "Redirect to dashboard"
else "Invalid credentials"
Svc->>DB : "Increment attempts"
Svc-->>SignIn : "Error with remaining attempts"
SignIn->>User : "Show error message"
end
else "User not found"
SignIn->>User : "Show account not found error"
end
```

**Diagram sources**
- [SigninPage.tsx](file://pages/SigninPage.tsx#L23-L95)
- [supabaseService.ts](file://services/supabaseService.ts#L26-L66)

**Section sources**
- [SigninPage.tsx](file://pages/SigninPage.tsx#L23-L95)

### Error Handling Strategies
The system implements comprehensive error handling:
- Specific error messages for different failure scenarios
- Graceful degradation when lockout periods are active
- User-friendly messaging with actionable information
- Consistent error propagation through the call stack

Security measures:
- Vague error messages for failed attempts
- Clear lockout timing information
- Immediate lockout after threshold exceeded

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L36-L65)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L46-L91)

### Security Measures
Key security features implemented:
- SHA-256 password hashing
- Lockout protection after 5 failed attempts
- 15-minute lockout duration
- Case-insensitive identifier matching
- Attempt reset on successful authentication
- Security context capture for notifications

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L57-L61)
- [emailService.ts](file://services/emailService.ts#L39-L65)

## Dependency Analysis
The authentication system has minimal external dependencies focused on Supabase integration and email notifications.

```mermaid
graph TB
subgraph "Internal Dependencies"
Types["types.ts"]
Consts["constants.tsx"]
end
subgraph "External Dependencies"
SupabaseJS["@supabase/supabase-js"]
EmailJS["EmailJS API"]
end
Svc["supabaseService.ts"] --> SupabaseJS
Svc --> Types
SignIn["SigninPage.tsx"] --> Svc
SignIn --> EmailJS
Email["emailService.ts"] --> EmailJS
Email --> Consts
```

**Diagram sources**
- [supabaseService.ts](file://services/supabaseService.ts#L1-L7)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L1-L12)
- [emailService.ts](file://services/emailService.ts#L1-L10)
- [types.ts](file://types.ts#L1-L31)
- [constants.tsx](file://constants.tsx#L1-L361)
- [package.json](file://package.json#L12-L18)

**Section sources**
- [package.json](file://package.json#L12-L18)
- [supabaseService.ts](file://services/supabaseService.ts#L1-L7)
- [emailService.ts](file://services/emailService.ts#L1-L10)

## Performance Considerations
Performance characteristics of the authentication system:
- Single database query per authentication attempt
- Minimal client-side processing with SHA-256 hashing
- Efficient multi-field lookup using OR conditions
- Asynchronous operations prevent UI blocking
- Email notifications are sent asynchronously

Optimization opportunities:
- Add database indexes on frequently queried fields (username, login_id, mobile, email)
- Consider caching user records for active sessions
- Implement connection pooling for database operations
- Add rate limiting for authentication endpoints

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L29-L34)
- [SigninPage.tsx](file://pages/SigninPage.tsx#L32-L36)

## Troubleshooting Guide
Common issues and resolutions:

### Authentication Failures
- **Account not found**: Verify the identifier exists in any of the supported fields
- **Locked out**: Wait for the 15-minute lockout period to expire
- **Invalid credentials**: Check password correctness and ensure no extra spaces
- **Network errors**: Verify Supabase connectivity and API keys

### Database Schema Issues
- **Missing fields**: Ensure users table contains required fields (password_hash, failed_login_attempts, locked_until, last_login)
- **Indexing problems**: Add indexes on lookup fields for improved performance
- **Data normalization**: Ensure consistent data formatting across identifier fields

### Security Notifications
- **Email delivery failures**: Check EmailJS configuration and network connectivity
- **Security context capture**: IP detection may fail in restricted environments

**Section sources**
- [supabaseService.ts](file://services/supabaseService.ts#L36-L65)
- [emailService.ts](file://services/emailService.ts#L114-L137)

## Conclusion
The Supabase authentication service provides a robust, security-focused authentication system with the following key strengths:
- Comprehensive multi-field user lookup capabilities
- Strong security measures including lockout protection and SHA-256 hashing
- User-friendly error handling and feedback mechanisms
- Seamless integration with Supabase for database operations
- Automated security notifications for user awareness

The implementation balances security with usability while maintaining clean separation of concerns between UI, service, and database layers. Future enhancements could include database indexing, session caching, and additional security features like two-factor authentication.