/**
 * Centralized Configuration Index
 * Export all configuration files together for easy importing
 */

// Export data IDs configuration
export { dataIds } from './dataIds';

// Export colors configuration
export { colors } from './colors';

// Export API configuration
export { apiConfig, apiTimeout, apiRetry } from './apiConfig';

// Export database configuration
export { 
  dbConfig, 
  TABLES, 
  USER_COLUMNS, 
  PROFILE_COLUMNS, 
  ADDRESS_COLUMNS, 
  PAYMENT_METHOD_COLUMNS, 
  ORDER_COLUMNS 
} from './dbConfig';

// Export AI services configuration
export { 
  aiServicesConfig, 
  imageGenerator, 
  textAnalysis, 
  voiceService, 
  recommendationEngine, 
  nlpProcessor,
  aiApiKeys,
  aiEndpoints
} from './aiServicesConfig';

// Export storage configuration
export { 
  storageConfig,
  primaryStorage,
  secondaryStorage,
  cdn,
  upload,
  assets,
  storagePaths,
  fileSizeLimits,
  allowedFileTypes
} from './storageConfig';

// Export email configuration
export { 
  emailConfig 
} from './emailConfig';

// Individual exports are available above.
// For a combined config object, import individual configs as needed in your components/pages.