# Centralized Configuration System

## Overview
The centralized configuration system provides a unified approach to manage all configuration values across the ZPRIA application. This system eliminates hardcoded values and allows for easy updates across the entire application from a single location.

## Configuration Files Structure

### 1. dataIds.ts
Contains all data-ids used across the application for automated testing and element identification.

### 2. colors.ts
Manages all color values used throughout the application for consistent theming.

### 3. apiConfig.ts
Stores all API endpoints and configuration settings for service communication.

### 4. dbConfig.ts
Contains database configuration including table names, column definitions, and connection settings.

### 5. aiServicesConfig.ts
Manages configurations for all AI services including API keys, endpoints, and rate limits.

### 6. storageConfig.ts
Handles storage system configurations for both primary and secondary storage systems.

### 7. emailConfig.ts
Centralizes all email service configurations including EmailJS settings.

## How to Use

### Import Configuration
```typescript
import { dataIds, colors, apiConfig, dbConfig, aiServicesConfig, storageConfig, emailConfig } from '../config';
```

### Use Configuration Values
```typescript
// Example: Using data IDs in JSX
<button data-id={dataIds.btnSubmit}>Submit</button>

// Example: Using API endpoints
const response = await fetch(apiConfig.auth.login);

// Example: Using database table names
const { data } = await supabase.from(dbConfig.tables.users).select('*');
```

## Benefits

1. **Single Source of Truth**: All configurations are managed in one place
2. **Easy Maintenance**: Changes in one file affect the entire application
3. **Consistency**: Ensures uniform values across all components
4. **Scalability**: Easy to add new configuration values as the application grows
5. **Testing**: Centralized data-ids facilitate automated testing

## Adding New Configuration Values

1. Identify where the new configuration belongs (dataIds, apiConfig, etc.)
2. Add the new value to the appropriate configuration file
3. Export the value in the index.ts file if needed
4. Update all references to use the centralized configuration

## Best Practices

- Always use the centralized configuration instead of hardcoded values
- Group related configuration values together
- Use descriptive names for configuration keys
- Maintain consistency in naming conventions
- Document complex configuration values with comments