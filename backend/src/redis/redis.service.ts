import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        this.client = new Redis({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            console.log('✅ Redis connected');
        });

        this.client.on('error', (err) => {
            console.error('❌ Redis error:', err);
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
        console.log('👋 Redis disconnected');
    }

    getClient(): Redis {
        return this.client;
    }

    // ============================================
    // Key-Value Operations
    // ============================================

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await this.client.setex(key, ttl, serialized);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }

    async ttl(key: string): Promise<number> {
        return this.client.ttl(key);
    }

    async expire(key: string, seconds: number): Promise<void> {
        await this.client.expire(key, seconds);
    }

    // ============================================
    // Nonce Storage (Anti-Replay)
    // ============================================

    async storeNonce(nonce: string, ttl: number = 600): Promise<void> {
        await this.set(`nonce:${nonce}`, true, ttl);
    }

    async isNonceUsed(nonce: string): Promise<boolean> {
        return this.exists(`nonce:${nonce}`);
    }

    // ============================================
    // Session Management
    // ============================================

    async setSession(sessionId: string, data: any, ttl: number): Promise<void> {
        await this.set(`session:${sessionId}`, data, ttl);
    }

    async getSession<T>(sessionId: string): Promise<T | null> {
        return this.get<T>(`session:${sessionId}`);
    }

    async delSession(sessionId: string): Promise<void> {
        await this.del(`session:${sessionId}`);
    }

    // ============================================
    // Rate Limiting
    // ============================================

    async incrementRateLimit(key: string, ttl: number): Promise<number> {
        const value = await this.client.incr(`rate:${key}`);
        if (value === 1) {
            await this.client.expire(`rate:${key}`, ttl);
        }
        return value;
    }

    async getRateLimit(key: string): Promise<number> {
        const value = await this.client.get(`rate:${key}`);
        return value ? parseInt(value, 10) : 0;
    }

    async resetRateLimit(key: string): Promise<void> {
        await this.del(`rate:${key}`);
    }

    // ============================================
    // Token Blacklist
    // ============================================

    async blacklistToken(token: string, ttl: number): Promise<void> {
        await this.set(`blacklist:${token}`, true, ttl);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        return this.exists(`blacklist:${token}`);
    }

    // ============================================
    // Pub/Sub
    // ============================================

    async publish(channel: string, message: any): Promise<void> {
        await this.client.publish(channel, JSON.stringify(message));
    }

    subscribe(channel: string, callback: (message: any) => void): void {
        const subscriber = this.client.duplicate();
        subscriber.subscribe(channel);
        subscriber.on('message', (ch, message) => {
            if (ch === channel) {
                callback(JSON.parse(message));
            }
        });
    }

    // ============================================
    // Utility
    // ============================================

    async flushAll(): Promise<void> {
        if (process.env.NODE_ENV !== 'production') {
            await this.client.flushall();
        }
    }

    async keys(pattern: string): Promise<string[]> {
        return this.client.keys(pattern);
    }
}
