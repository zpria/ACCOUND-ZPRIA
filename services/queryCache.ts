/**
 * Database Query Caching Layer
 * Redis-like in-memory caching for database queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

class QueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0
  };
  
  constructor(private maxSize: number = 1000) {
    this.cache = new Map();
  }
  
  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }
    
    // Update hit count
    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data as T;
  }
  
  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    // Check if we need to evict
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
    
    this.stats.size = this.cache.size;
  }
  
  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.hitRate = 0;
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Get keys matching pattern
   */
  keys(pattern?: string): string[] {
    if (!pattern) {
      return Array.from(this.cache.keys());
    }
    
    const regex = new RegExp(pattern.replace('*', '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }
  
  /**
   * Get cached values by pattern
   */
  getByPattern<T>(pattern: string): Map<string, T> {
    const result = new Map<string, T>();
    const keys = this.keys(pattern);
    
    for (const key of keys) {
      const value = this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }
    
    return result;
  }
  
  /**
   * Evict oldest entry (simple LRU - could be improved)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
    }
  }
  
  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Singleton instance
let cacheInstance: QueryCache | null = null;

export function getQueryCache(maxSize?: number): QueryCache {
  if (!cacheInstance) {
    cacheInstance = new QueryCache(maxSize);
  }
  return cacheInstance;
}

/**
 * Decorator for caching query results
 */
export function CachedQuery(ttl: number = 300000, keyPrefix: string = 'query') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = getQueryCache();
    
    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Higher-order function for caching async functions
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 300000,
  keyGenerator?: (...args: Parameters<T>) => string
) {
  const cache = getQueryCache();
  
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(...args)
      : `${fn.name}:${JSON.stringify(args)}`;
    
    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return cached as ReturnType<T>;
    }
    
    // Execute original function
    const result = await fn(...args);
    
    // Cache the result
    cache.set(cacheKey, result, ttl);
    
    return result;
  };
}

/**
 * Cache middleware for API routes
 */
export function cacheMiddleware(ttl: number = 300000) {
  const cache = getQueryCache();
  
  return async (req: Request, next: () => Promise<Response>) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key from URL
    const cacheKey = `api:${req.url}`;
    
    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached !== null) {
      return new Response(JSON.stringify(cached), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        }
      });
    }
    
    // Execute next middleware
    const response = await next();
    
    // Cache successful responses
    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, data, ttl);
    }
    
    return response;
  };
}

/**
 * Invalidate cache entries matching pattern
 */
export function invalidateCache(pattern: string): number {
  const cache = getQueryCache();
  const keys = cache.keys(pattern);
  
  let deletedCount = 0;
  for (const key of keys) {
    if (cache.delete(key)) {
      deletedCount++;
    }
  }
  
  return deletedCount;
}

/**
 * Warm up cache with frequently accessed data
 */
export async function warmupCache(
  queries: Array<{ key: string; fetcher: () => Promise<any> }>,
  ttl: number = 600000 // 10 minutes
): Promise<void> {
  const cache = getQueryCache();
  
  console.log(`🔥 Warming up cache with ${queries.length} queries...`);
  
  for (const { key, fetcher } of queries) {
    try {
      const data = await fetcher();
      cache.set(key, data, ttl);
      console.log(`✓ Cached: ${key}`);
    } catch (error) {
      console.error(`✗ Failed to cache ${key}:`, error);
    }
  }
  
  console.log('✅ Cache warmup complete');
}

export default QueryCache;
