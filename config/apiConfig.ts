/**
 * Centralized API Configuration
 * Store all API endpoints and base URLs in one place for easy management
 */

export const apiConfig = {
  // Base URLs
  baseURL: 'http://localhost:3000', // Default base URL - can be overridden in environment
  authBaseURL: 'http://localhost:3000', // Default auth base URL
  supabaseUrl: '', // Supabase URL will be configured separately

  // Authentication endpoints
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
    refreshToken: '/api/auth/refresh-token',
    userProfile: '/api/auth/profile',
  },

  // User management endpoints
  user: {
    getUser: '/api/user/get',
    updateUser: '/api/user/update',
    deleteUser: '/api/user/delete',
    changePassword: '/api/user/change-password',
    updateProfile: '/api/user/profile/update',
    getProfile: '/api/user/profile/get',
  },

  // Account management endpoints
  account: {
    getSettings: '/api/account/settings',
    updateSettings: '/api/account/settings/update',
    getPreferences: '/api/account/preferences',
    updatePreferences: '/api/account/preferences/update',
    getSecurity: '/api/account/security',
    updateSecurity: '/api/account/security/update',
    getNotifications: '/api/account/notifications',
    updateNotifications: '/api/account/notifications/update',
  },

  // Address management endpoints
  address: {
    getAll: '/api/address/all',
    create: '/api/address/create',
    update: '/api/address/update',
    delete: '/api/address/delete',
    setDefault: '/api/address/set-default',
  },

  // Payment management endpoints
  payment: {
    getMethods: '/api/payment/methods',
    addMethod: '/api/payment/methods/add',
    updateMethod: '/api/payment/methods/update',
    deleteMethod: '/api/payment/methods/delete',
    setDefault: '/api/payment/methods/set-default',
    processPayment: '/api/payment/process',
    getHistory: '/api/payment/history',
  },

  // Order management endpoints
  order: {
    getAll: '/api/orders/all',
    getSingle: '/api/orders/single',
    create: '/api/orders/create',
    update: '/api/orders/update',
    cancel: '/api/orders/cancel',
    getHistory: '/api/orders/history',
  },

  // Product related endpoints
  product: {
    getAll: '/api/products/all',
    getSingle: '/api/products/single',
    search: '/api/products/search',
    getCategories: '/api/products/categories',
    getReviews: '/api/products/reviews',
  },

  // Notification endpoints
  notification: {
    getAll: '/api/notifications/all',
    markAsRead: '/api/notifications/mark-read',
    markAllAsRead: '/api/notifications/mark-all-read',
    delete: '/api/notifications/delete',
    getUnreadCount: '/api/notifications/unread-count',
  },

  // File upload endpoints
  file: {
    upload: '/api/files/upload',
    delete: '/api/files/delete',
    getPresignedUrl: '/api/files/presigned-url',
  },

  // AI service endpoints
  ai: {
    generateImage: '/api/ai/generate-image',
    analyzeImage: '/api/ai/analyze-image',
    getRecommendations: '/api/ai/recommendations',
  },

  // Health check endpoint
  health: {
    check: '/api/health',
  },
};

// API request timeout configuration
export const apiTimeout = {
  default: 10000, // 10 seconds
  upload: 30000,  // 30 seconds for file uploads
  longRunning: 60000, // 60 seconds for long-running operations
};

// API retry configuration
export const apiRetry = {
  maxRetries: 3,
  delay: 1000, // 1 second
  backoffMultiplier: 2,
};