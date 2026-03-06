/**
 * Environment-Specific Configuration
 * Different settings for development, staging, and production
 */

// Environment detection
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('preview')) {
    return 'staging';
  }
  
  return 'production';
};

export const ENV = getEnvironment();

// Environment-specific configurations
export const envConfig = {
  development: {
    // Supabase Configuration
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL_DEV || 'https://dev.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_DEV || 'dev-key'
    },
    
    // API Configuration
    api: {
      baseUrl: 'http://localhost:3000/api',
      timeout: 30000,
      retries: 1
    },
    
    // Debug Settings
    debug: {
      enabled: true,
      verbose: true,
      logQueries: true,
      logApiCalls: true
    },
    
    // Feature Flags
    features: {
      aiAssistant: true,
      analytics: false,
      newUI: true,
      betaFeatures: true
    },
    
    // Rate Limiting (relaxed for development)
    rateLimit: {
      requestsPerMinute: 1000,
      concurrentRequests: 50
    },
    
    // Cache Settings
    cache: {
      enabled: false,
      ttl: 60000 // 1 minute
    }
  },
  
  staging: {
    // Supabase Configuration
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL_STAGING || 'https://staging.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_STAGING || 'staging-key'
    },
    
    // API Configuration
    api: {
      baseUrl: 'https://staging-api.example.com/api',
      timeout: 20000,
      retries: 2
    },
    
    // Debug Settings
    debug: {
      enabled: true,
      verbose: false,
      logQueries: false,
      logApiCalls: true
    },
    
    // Feature Flags
    features: {
      aiAssistant: true,
      analytics: true,
      newUI: true,
      betaFeatures: true
    },
    
    // Rate Limiting
    rateLimit: {
      requestsPerMinute: 500,
      concurrentRequests: 25
    },
    
    // Cache Settings
    cache: {
      enabled: true,
      ttl: 300000 // 5 minutes
    }
  },
  
  production: {
    // Supabase Configuration
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL_PROD || 'https://prod.supabase.co',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || 'prod-key'
    },
    
    // API Configuration
    api: {
      baseUrl: 'https://api.example.com/api',
      timeout: 15000,
      retries: 3
    },
    
    // Debug Settings
    debug: {
      enabled: false,
      verbose: false,
      logQueries: false,
      logApiCalls: false
    },
    
    // Feature Flags
    features: {
      aiAssistant: true,
      analytics: true,
      newUI: false,
      betaFeatures: false
    },
    
    // Rate Limiting (strict for production)
    rateLimit: {
      requestsPerMinute: 100,
      concurrentRequests: 10
    },
    
    // Cache Settings (aggressive caching)
    cache: {
      enabled: true,
      ttl: 600000 // 10 minutes
    }
  }
};

// Get current environment config
export const getCurrentConfig = () => envConfig[ENV];

// Helper functions
export const isDevelopment = () => ENV === 'development';
export const isStaging = () => ENV === 'staging';
export const isProduction = () => ENV === 'production';

// Export current config values
export const config = getCurrentConfig();
