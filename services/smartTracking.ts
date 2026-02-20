
// Smart User Behavior Tracking Service
// Auto-detects user preferences, behavior, and provides smart recommendations

import { supabase } from './supabaseService';
import { logActivity } from './deviceDetection';

// Track page visit with time spent
export const trackPageVisit = async (
  userId: string,
  page: string,
  entryTime: number
) => {
  const timeSpent = Math.floor((Date.now() - entryTime) / 1000); // in seconds
  
  try {
    await supabase.from('user_page_visits').insert([{
      user_id: userId,
      page,
      time_spent_seconds: timeSpent,
      visited_at: new Date().toISOString()
    }]);
    
    // Update user stats
    await updateUserStats(userId, { page_visits: 1, time_spent: timeSpent });
  } catch (err) {
    console.error('Failed to track page visit:', err);
  }
};

// Track user interactions
export const trackInteraction = async (
  userId: string,
  action: string,
  element: string,
  metadata?: Record<string, any>
) => {
  try {
    await supabase.from('user_interactions').insert([{
      user_id: userId,
      action,
      element,
      metadata: metadata || {},
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('Failed to track interaction:', err);
  }
};

// Auto-detect user interests based on behavior
export const detectUserInterests = async (userId: string): Promise<string[]> => {
  try {
    // Get page visits
    const { data: visits } = await supabase
      .from('user_page_visits')
      .select('page, time_spent_seconds')
      .eq('user_id', userId)
      .gte('visited_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    // Get interactions
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('action, element')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const interests: Record<string, number> = {};
    
    // Analyze page visits
    visits?.forEach(visit => {
      const interest = pageToInterest(visit.page);
      if (interest) {
        interests[interest] = (interests[interest] || 0) + visit.time_spent_seconds;
      }
    });
    
    // Analyze interactions
    interactions?.forEach(interaction => {
      const interest = interactionToInterest(interaction.action, interaction.element);
      if (interest) {
        interests[interest] = (interests[interest] || 0) + 10; // Weight interactions less
      }
    });
    
    // Sort by score and return top interests
    return Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([interest]) => interest);
  } catch (err) {
    console.error('Failed to detect interests:', err);
    return [];
  }
};

// Map page to interest category
const pageToInterest = (page: string): string | null => {
  const mappings: Record<string, string> = {
    '/account/orders': 'shopping',
    '/account/payments': 'finance',
    '/account/profile': 'personal',
    '/account/security': 'security',
    '/account/privacy': 'privacy',
    '/account/notifications': 'communication',
    '/account/apps': 'technology',
    '/product-hub': 'products',
    '/support': 'support'
  };
  
  return mappings[page] || null;
};

// Map interaction to interest
const interactionToInterest = (action: string, element: string): string | null => {
  if (action.includes('click') && element.includes('product')) return 'shopping';
  if (action.includes('click') && element.includes('payment')) return 'finance';
  if (action.includes('click') && element.includes('security')) return 'security';
  if (action.includes('search')) return 'research';
  return null;
};

// Update user stats
const updateUserStats = async (
  userId: string,
  increment: { page_visits?: number; time_spent?: number }
) => {
  try {
    const { data: existing } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existing) {
      await supabase
        .from('user_stats')
        .update({
          total_page_visits: existing.total_page_visits + (increment.page_visits || 0),
          total_time_spent_seconds: existing.total_time_spent_seconds + (increment.time_spent || 0),
          last_active_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase.from('user_stats').insert([{
        user_id: userId,
        total_page_visits: increment.page_visits || 0,
        total_time_spent_seconds: increment.time_spent || 0,
        last_active_at: new Date().toISOString()
      }]);
    }
  } catch (err) {
    console.error('Failed to update stats:', err);
  }
};

// Calculate user engagement score
export const calculateEngagementScore = async (userId: string): Promise<number> => {
  try {
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!stats) return 0;
    
    // Calculate based on visits, time spent, and recency
    const daysSinceLastActive = Math.floor(
      (Date.now() - new Date(stats.last_active_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const recencyScore = Math.max(0, 30 - daysSinceLastActive) / 30;
    const visitsScore = Math.min(stats.total_page_visits / 100, 1);
    const timeScore = Math.min(stats.total_time_spent_seconds / 3600, 1); // hours
    
    return Math.round((recencyScore * 0.4 + visitsScore * 0.3 + timeScore * 0.3) * 100);
  } catch (err) {
    console.error('Failed to calculate engagement:', err);
    return 0;
  }
};

// Auto-detect best contact time
export const detectBestContactTime = async (userId: string): Promise<string> => {
  try {
    const { data: activities } = await supabase
      .from('user_activity_logs')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!activities || activities.length === 0) return '09:00';
    
    // Count activities by hour
    const hourCounts: Record<number, number> = {};
    activities.forEach(activity => {
      const hour = new Date(activity.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // Find most active hour
    const bestHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    return `${bestHour.toString().padStart(2, '0')}:00`;
  } catch (err) {
    return '09:00';
  }
};

// Predict next action
export const predictNextAction = async (userId: string): Promise<string | null> => {
  try {
    const { data: recentActions } = await supabase
      .from('user_activity_logs')
      .select('action')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!recentActions) return null;
    
    // Simple pattern: if user checked security settings, might want to update password
    const actions = recentActions.map(a => a.action);
    
    if (actions.includes('security_change') && !actions.includes('password_change')) {
      return 'password_change';
    }
    
    if (actions.includes('login') && actions.filter(a => a === 'login').length > 3) {
      return 'enable_2fa';
    }
    
    return null;
  } catch (err) {
    return null;
  }
};

// Get smart user summary
export const getSmartUserSummary = async (userId: string) => {
  const [
    interests,
    engagementScore,
    bestContactTime,
    predictedAction
  ] = await Promise.all([
    detectUserInterests(userId),
    calculateEngagementScore(userId),
    detectBestContactTime(userId),
    predictNextAction(userId)
  ]);
  
  return {
    interests,
    engagementScore,
    bestContactTime,
    predictedAction,
    recommendations: generateRecommendations(interests, engagementScore)
  };
};

// Generate smart recommendations
const generateRecommendations = (
  interests: string[],
  engagementScore: number
): string[] => {
  const recommendations: string[] = [];
  
  if (engagementScore < 30) {
    recommendations.push('Send re-engagement email');
  }
  
  if (interests.includes('security')) {
    recommendations.push('Offer security tips');
  }
  
  if (interests.includes('shopping')) {
    recommendations.push('Show personalized product recommendations');
  }
  
  if (!interests.includes('privacy')) {
    recommendations.push('Prompt to review privacy settings');
  }
  
  return recommendations;
};

// Smart session tracking
export const startSmartSession = (userId: string) => {
  const sessionStart = Date.now();
  const pageVisits: Record<string, number> = {};
  
  // Track current page
  let currentPage = window.location.pathname;
  let pageEntryTime = sessionStart;
  
  // Track page changes
  const trackPageChange = () => {
    const newPage = window.location.pathname;
    if (newPage !== currentPage) {
      // Save previous page visit
      trackPageVisit(userId, currentPage, pageEntryTime);
      
      // Start tracking new page
      currentPage = newPage;
      pageEntryTime = Date.now();
    }
  };
  
  // Set up listeners
  window.addEventListener('popstate', trackPageChange);
  
  // Track before unload
  window.addEventListener('beforeunload', () => {
    trackPageVisit(userId, currentPage, pageEntryTime);
  });
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', trackPageChange);
    trackPageVisit(userId, currentPage, pageEntryTime);
  };
};

export default {
  trackPageVisit,
  trackInteraction,
  detectUserInterests,
  calculateEngagementScore,
  detectBestContactTime,
  predictNextAction,
  getSmartUserSummary,
  startSmartSession
};
