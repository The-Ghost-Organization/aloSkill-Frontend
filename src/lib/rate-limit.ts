import type { NextRequest } from "next/server";

interface RateLimitConfig {
  max: number;
  windowMs: number;
}

interface RateLimitResult {
  blocked: boolean;
  retryAfter: string;
  limit: number;
  remaining: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private configs: { [key: string]: RateLimitConfig } = {
    "/auth/signin": { max: 5, windowMs: 15 * 60 * 1000 },
    "/auth/signup": { max: 5, windowMs: 60 * 60 * 1000 },
    "/api/": { max: 100, windowMs: 60 * 1000 },
    "/video/": { max: 20, windowMs: 60 * 1000 },
    "/exam/": { max: 10, windowMs: 30 * 1000 },
    "/document/": { max: 15, windowMs: 60 * 1000 },
    default: { max: 200, windowMs: 60 * 1000 },
  };

  async checkMultiLayer(request: NextRequest): Promise<RateLimitResult> {
    const clientIP = this.getClientIP(request);
    const pathname = request.nextUrl.pathname;

    // Check global IP limit
    const globalResult = await this.checkLimit(
      clientIP,
      "global",
      this.configs["default"] as RateLimitConfig
    );
    if (globalResult.blocked) return globalResult;

    // Check endpoint-specific limit
    const endpointConfig = this.getEndpointConfig(pathname);
    const endpointResult = await this.checkLimit(clientIP, pathname, endpointConfig);

    return endpointResult;
  }

  private async checkLimit(
    identifier: string,
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const storeKey = `rate_limit:${identifier}:${key}`;
    const now = Date.now();

    const record = this.store.get(storeKey);

    if (!record || now > record.resetTime) {
      this.store.set(storeKey, {
        count: 1,
        resetTime: now + config.windowMs,
      });

      return {
        blocked: false,
        retryAfter: "0",
        limit: config.max,
        remaining: config.max - 1,
        resetTime: now + config.windowMs,
      };
    }

    if (record.count >= config.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000).toString();
      return {
        blocked: true,
        retryAfter,
        limit: config.max,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    record.count++;

    return {
      blocked: false,
      retryAfter: "0",
      limit: config.max,
      remaining: config.max - record.count,
      resetTime: record.resetTime,
    };
  }

  private getEndpointConfig(pathname: string): RateLimitConfig {
    for (const [route, config] of Object.entries(this.configs)) {
      if (pathname.startsWith(route)) {
        return config;
      }
    }
    return this.configs["default"] as RateLimitConfig;
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    );
  }

  // Clean up expired entries (call this periodically)
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// For Redis implementation in production:
/*
import Redis from 'ioredis';
class RedisRateLimiter extends RateLimiter {
  private redis: Redis;
  
  constructor() {
    super();
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  // Override methods to use Redis instead of memory
}
*/
