/**
 * Centralized User Session Management
 * 
 * Eliminates duplicate code across all Account Management pages
 * All user-related operations now use these utilities (1+1=1 principle)
 */

import { supabase } from './supabaseService';
import { dbConfig } from '../config/dbConfig';

// ============================================================================
// USER SESSION MANAGEMENT
// ============================================================================

export interface UserData {
  id: string;
  username: string;
  login_id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  [key: string]: any;
}

/**
 * Get current logged-in user from localStorage
 * @returns User data object or null if not logged in
 */
export const getCurrentUser = (): UserData | null => {
  try {
    const savedUser = localStorage.getItem('zpria_user');
    if (!savedUser) return null;
    return JSON.parse(savedUser);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns true if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

/**
 * Get user ID safely
 * @returns User ID or null
 */
export const getUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Update user data in localStorage
 * @param userData - New user data to merge
 */
export const updateLocalStorageUser = (userData: Partial<UserData>): void => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('zpria_user', JSON.stringify(updatedUser));
  }
};

/**
 * Clear user session (logout)
 */
export const clearUserSession = (): void => {
  localStorage.removeItem('zpria_user');
};

// ============================================================================
// DATABASE QUERY UTILITIES
// ============================================================================

/**
 * Fetch current user's data from database
 * @returns User data or null
 */
export const fetchCurrentUserFromDB = async () => {
  try {
    const userId = getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from(dbConfig.tables.users)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Update user profile in database
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Success status
 */
export const updateUserProfileDB = async (
  userId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(dbConfig.tables.users)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
};

/**
 * Generic fetch function for user-related data
 * @param tableName - Table name from dbConfig
 * @param selectQuery - Select query string
 * @param additionalFilters - Additional filter functions
 * @returns Fetched data
 */
export const fetchUserData = async (
  tableName: string,
  selectQuery: string = '*',
  additionalFilters?: (query: any) => any
) => {
  try {
    const userId = getUserId();
    if (!userId) return null;

    let query = supabase
      .from(tableName)
      .select(selectQuery)
      .eq('user_id', userId);

    if (additionalFilters) {
      query = additionalFilters(query);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return null;
  }
};

/**
 * Generic insert function for user-related data
 * @param tableName - Table name from dbConfig
 * @param data - Data to insert
 * @returns Inserted data
 */
export const insertUserData = async (
  tableName: string,
  data: Record<string, any>
) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data: result, error } = await supabase
      .from(tableName)
      .insert({
        ...data,
        user_id: userId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    return null;
  }
};

/**
 * Generic update function for user-related data
 * @param tableName - Table name from dbConfig
 * @param itemId - Item ID to update
 * @param updates - Fields to update
 * @returns Success status
 */
export const updateUserData = async (
  tableName: string,
  itemId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    return false;
  }
};

/**
 * Generic delete function for user-related data
 * @param tableName - Table name from dbConfig
 * @param itemId - Item ID to delete
 * @returns Success status
 */
export const deleteUserData = async (
  tableName: string,
  itemId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting from ${tableName}:`, error);
    return false;
  }
};

// ============================================================================
// NAVIGATION GUARDS
// ============================================================================

/**
 * Require authentication - redirect if not logged in
 * @param navigate - Navigate function from react-router-dom
 * @param redirectPath - Path to redirect to (default: /signin)
 * @returns true if authenticated, false otherwise
 */
export const requireAuth = (navigate: (path: string) => void, redirectPath = '/signin'): boolean => {
  if (!isAuthenticated()) {
    navigate(redirectPath);
    return false;
  }
  return true;
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Standardized error message handler
 * @param error - Error object or string
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Log error with context for debugging
 * @param context - Operation context
 * @param error - Error object
 */
export const logError = (context: string, error: any): void => {
  console.error(`[${context}]`, error);
  // In production, send to monitoring service
};

// ============================================================================
// LOADING & STATE MANAGEMENT UTILITIES
// ============================================================================

/**
 * Create standardized loading state handler
 * @param setLoading - State setter for loading
 * @returns Object with start/end loading functions
 */
export const createLoadingHandler = (setLoading: (loading: boolean) => void) => ({
  start: () => setLoading(true),
  end: () => setLoading(false),
  wrap: async <T>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      const result = await fn();
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }
});

/**
 * Create standardized error state handler
 * @param setError - State setter for error
 * @returns Object with error handling functions
 */
export const createErrorHandler = (setError: (error: string) => void) => ({
  set: (error: any) => setError(getErrorMessage(error)),
  clear: () => setError(''),
  wrap: async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      setError(getErrorMessage(error));
      return null;
    }
  }
});

/**
 * Create standardized success message handler
 * @param setSuccess - State setter for success
 * @returns Object with success message functions
 */
export const createSuccessHandler = (setSuccess: (message: string) => void) => ({
  show: (message: string, duration = 3000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), duration);
  },
  clear: () => setSuccess('')
});
