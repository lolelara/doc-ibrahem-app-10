import { LRUCache } from 'lru-cache';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimiter {
  check: (limit: number, token: string) => Promise<void>;
}

export function rateLimit(options: RateLimitOptions): RateLimiter {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1]);
      } else {
        tokenCount[0] += 1;
        if (tokenCount[0] > limit) {
          throw new Error('Rate limit exceeded');
        }
        tokenCache.set(token, tokenCount);
      }

      return Promise.resolve();
    },
  };
} 