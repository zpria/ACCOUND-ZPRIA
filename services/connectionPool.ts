/**
 * Database Connection Pooling Optimization
 * Configure optimal connection settings for different environments
 */

import { supabase } from '../services/supabaseService';
import { envConfig } from '../config/envConfig';
import { dbConfig } from '../config';

interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  idleTimeout: number;
  acquireTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Environment-specific pool configurations
const poolConfigs: Record<string, PoolConfig> = {
  development: {
    maxConnections: 10,
    minConnections: 2,
    idleTimeout: 30000,      // 30 seconds
    acquireTimeout: 5000,     // 5 seconds
    retryAttempts: 3,
    retryDelay: 1000          // 1 second
  },
  
  staging: {
    maxConnections: 25,
    minConnections: 5,
    idleTimeout: 60000,       // 1 minute
    acquireTimeout: 10000,    // 10 seconds
    retryAttempts: 5,
    retryDelay: 2000          // 2 seconds
  },
  
  production: {
    maxConnections: 50,
    minConnections: 10,
    idleTimeout: 120000,      // 2 minutes
    acquireTimeout: 15000,    // 15 seconds
    retryAttempts: 10,
    retryDelay: 3000          // 3 seconds
  }
};

// Get current environment - use development settings if debug is enabled
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const poolConfig = poolConfigs[isDevelopment ? 'development' : 'production'];

/**
 * Query optimizer with connection pooling
 */
export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private activeQueries = new Map<string, Promise<any>>();
  
  private constructor() {}
  
  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }
  
  /**
   * Execute query with pooling and caching
   */
  async execute<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: {
      cache?: boolean;
      ttl?: number;
      deduplicate?: boolean;
    } = {}
  ): Promise<T> {
    const { cache = false, ttl = 60000, deduplicate = true } = options;
    
    // Check cache first
    if (cache) {
      const cached = this.queryCache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`[Cache Hit] ${key}`);
        return cached.data as T;
      }
    }
    
    // Deduplicate concurrent requests
    if (deduplicate && this.activeQueries.has(key)) {
      console.log(`[Deduplicated] ${key}`);
      return this.activeQueries.get(key) as Promise<T>;
    }
    
    try {
      // Execute query
      const promise = queryFn();
      
      if (deduplicate) {
        this.activeQueries.set(key, promise);
      }
      
      const result = await promise;
      
      // Cache result
      if (cache) {
        this.queryCache.set(key, {
          data: result,
          timestamp: Date.now()
        });
      }
      
      return result;
    } finally {
      // Cleanup
      this.activeQueries.delete(key);
    }
  }
  
  /**
   * Clear cache for specific key or all
   */
  clearCache(key?: string) {
    if (key) {
      this.queryCache.delete(key);
    } else {
      this.queryCache.clear();
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.queryCache.size,
      activeQueries: this.activeQueries.size,
      poolConfig
    };
  }
}

/**
 * Batch query executor
 */
export async function executeBatch<T>(
  queries: Array<() => Promise<T>>,
  concurrencyLimit: number = poolConfig.maxConnections
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const query of queries) {
    const promise = Promise.resolve().then(async () => {
      const result = await query();
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrencyLimit) {
      await Promise.race(executing);
      // Remove completed promises
      const stillExecuting = executing.filter(p => 
        !((p as any).status === 'fulfilled' || (p as any).status === 'rejected')
      );
      executing.length = 0;
      executing.push(...stillExecuting);
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = poolConfig.retryAttempts,
  delay: number = poolConfig.retryDelay
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    console.log(`Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, retries - 1, delay * 2); // Exponential backoff
  }
}

/**
 * Monitor connection health
 */
export async function monitorConnectionHealth() {
  const startTime = Date.now();
  
  try {
    // Simple health check query
    const result = await supabase
      .from(dbConfig.tables.system_health_logs)
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: true,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const optimizer = QueryOptimizer.getInstance();
