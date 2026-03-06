/**
 * API Endpoint Documentation
 * All available API endpoints using centralized configuration
 */

import { apiConfig } from './apiConfig';

// Base URL from config
const BASE_URL = apiConfig.baseURL;

/**
 * API Endpoints Reference
 * 
 * Usage Example:
 * ```typescript
 * // Get all users
 * const users = await fetch(API_ENDPOINTS.users.all);
 * 
 * // Get specific user
 * const user = await fetch(API_ENDPOINTS.users.byId('user-id'));
 * ```
 */

export const API_ENDPOINTS = {
  // User Management
  users: {
    all: `${BASE_URL}/users`,
    byId: (id: string) => `${BASE_URL}/users/${id}`,
    byUsername: (username: string) => `${BASE_URL}/users/username/${username}`,
    byEmail: (email: string) => `${BASE_URL}/users/email/${email}`,
    create: `${BASE_URL}/users`,
    update: (id: string) => `${BASE_URL}/users/${id}`,
    delete: (id: string) => `${BASE_URL}/users/${id}`,
    
    // User sub-resources
    addresses: (userId: string) => `${BASE_URL}/users/${userId}/addresses`,
    paymentMethods: (userId: string) => `${BASE_URL}/users/${userId}/payment-methods`,
    orders: (userId: string) => `${BASE_URL}/users/${userId}/orders`,
    carts: (userId: string) => `${BASE_URL}/users/${userId}/cart`,
    wishlist: (userId: string) => `${BASE_URL}/users/${userId}/wishlist`,
    devices: (userId: string) => `${BASE_URL}/users/${userId}/devices`,
    sessions: (userId: string) => `${BASE_URL}/users/${userId}/sessions`
  },
  
  // Authentication
  auth: {
    signin: `${BASE_URL}/auth/signin`,
    signup: `${BASE_URL}/auth/signup`,
    signout: `${BASE_URL}/auth/signout`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    verifyEmail: `${BASE_URL}/auth/verify-email`,
    verifyPhone: `${BASE_URL}/auth/verify-phone`,
    resendOtp: `${BASE_URL}/auth/resend-otp`,
    
    // Two-Factor Auth
    twoFactor: {
      setup: `${BASE_URL}/auth/2fa/setup`,
      enable: `${BASE_URL}/auth/2fa/enable`,
      disable: `${BASE_URL}/auth/2fa/disable`,
      verify: `${BASE_URL}/auth/2fa/verify`
    },
    
    // Sessions
    sessions: `${BASE_URL}/auth/sessions`,
    session: (sessionId: string) => `${BASE_URL}/auth/sessions/${sessionId}`
  },
  
  // Products
  products: {
    all: `${BASE_URL}/products`,
    byId: (id: string) => `${BASE_URL}/products/${id}`,
    byType: (type: string) => `${BASE_URL}/products/type/${type}`,
    byCategory: (category: string) => `${BASE_URL}/products/category/${category}`,
    search: `${BASE_URL}/products/search`,
    featured: `${BASE_URL}/products/featured`,
    active: `${BASE_URL}/products/active`,
    
    // Product sub-resources
    images: (productId: string) => `${BASE_URL}/products/${productId}/images`,
    reviews: (productId: string) => `${BASE_URL}/products/${productId}/reviews`,
    ratings: (productId: string) => `${BASE_URL}/products/${productId}/ratings`,
    inventory: (productId: string) => `${BASE_URL}/products/${productId}/inventory`,
    prices: (productId: string) => `${BASE_URL}/products/${productId}/prices`,
    variants: (productId: string) => `${BASE_URL}/products/${productId}/variants`
  },
  
  // Orders
  orders: {
    all: `${BASE_URL}/orders`,
    byId: (id: string) => `${BASE_URL}/orders/${id}`,
    byUser: (userId: string) => `${BASE_URL}/users/${userId}/orders`,
    create: `${BASE_URL}/orders`,
    update: (id: string) => `${BASE_URL}/orders/${id}`,
    cancel: (id: string) => `${BASE_URL}/orders/${id}/cancel`,
    
    // Order items
    items: (orderId: string) => `${BASE_URL}/orders/${orderId}/items`,
    track: (orderId: string) => `${BASE_URL}/orders/${orderId}/track`
  },
  
  // Cart
  cart: {
    get: (userId: string) => `${BASE_URL}/users/${userId}/cart`,
    addItem: (userId: string) => `${BASE_URL}/users/${userId}/cart/items`,
    updateItem: (userId: string, itemId: string) => `${BASE_URL}/users/${userId}/cart/items/${itemId}`,
    removeItem: (userId: string, itemId: string) => `${BASE_URL}/users/${userId}/cart/items/${itemId}`,
    clear: (userId: string) => `${BASE_URL}/users/${userId}/cart/clear`
  },
  
  // AI Services
  ai: {
    // Chat
    chat: `${BASE_URL}/ai/chat`,
    conversations: `${BASE_URL}/ai/conversations`,
    conversation: (id: string) => `${BASE_URL}/ai/conversations/${id}`,
    messages: (conversationId: string) => `${BASE_URL}/ai/conversations/${conversationId}/messages`,
    
    // Image Generation
    generateImage: `${BASE_URL}/ai/generate/image`,
    generateText: `${BASE_URL}/ai/generate/text`,
    generateCode: `${BASE_URL}/ai/generate/code`,
    
    // Recommendations
    recommendations: (userId: string) => `${BASE_URL}/ai/recommendations/${userId}`,
    
    // Usage Stats
    usage: (userId: string) => `${BASE_URL}/ai/usage/${userId}`
  },
  
  // Notifications
  notifications: {
    all: `${BASE_URL}/notifications`,
    byId: (id: string) => `${BASE_URL}/notifications/${id}`,
    unread: `${BASE_URL}/notifications/unread`,
    markAsRead: (id: string) => `${BASE_URL}/notifications/${id}/read`,
    markAllAsRead: `${BASE_URL}/notifications/read-all`,
    
    // Preferences
    preferences: `${BASE_URL}/notifications/preferences`,
    updatePreferences: `${BASE_URL}/notifications/preferences/update`
  },
  
  // File Upload
  files: {
    upload: `${BASE_URL}/files/upload`,
    byId: (id: string) => `${BASE_URL}/files/${id}`,
    delete: (id: string) => `${BASE_URL}/files/${id}`,
    public: `${BASE_URL}/files/public`,
    private: `${BASE_URL}/files/private`
  },
  
  // Analytics
  analytics: {
    userActivity: (userId: string) => `${BASE_URL}/analytics/users/${userId}`,
    systemHealth: `${BASE_URL}/analytics/system/health`,
    logs: `${BASE_URL}/analytics/logs`,
    metrics: `${BASE_URL}/analytics/metrics`
  },
  
  // Apps
  apps: {
    all: `${BASE_URL}/apps`,
    byId: (id: string) => `${BASE_URL}/apps/${id}`,
    bySlug: (slug: string) => `${BASE_URL}/apps/slug/${slug}`,
    connected: (userId: string) => `${BASE_URL}/users/${userId}/connected-apps`,
    connect: (appId: string) => `${BASE_URL}/apps/${appId}/connect`,
    disconnect: (appId: string) => `${BASE_URL}/apps/${appId}/disconnect`
  },
  
  // Health Check
  health: {
    status: `${BASE_URL}/health`,
    database: `${BASE_URL}/health/database`,
    services: `${BASE_URL}/health/services`
  }
};

/**
 * HTTP Methods for each endpoint
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Fetch wrapper with error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'FETCH_ERROR'
      }
    };
  }
}
