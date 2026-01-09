/**
 * Redis Cache Service
 * Provides caching layer for improved performance
 * Falls back gracefully if Redis is unavailable
 */
const redis = require('redis');

class RedisCache {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.defaultTTL = 300; // 5 minutes default
    }

    async connect() {
        try {
            this.client = redis.createClient({
                url: process.env.REDIS_URL || 'redis://redis:6379'
            });

            this.client.on('error', (err) => {
                console.warn('Redis Client Error (non-critical):', err.message);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Redis Cache connected');
                this.isConnected = true;
            });

            this.client.on('disconnect', () => {
                console.log('Redis Cache disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
        } catch (error) {
            console.warn('Redis connection failed (caching disabled):', error.message);
            this.isConnected = false;
        }
    }

    /**
     * Get cached value
     * @param {string} key - Cache key
     * @returns {object|null} - Cached value or null
     */
    async get(key) {
        if (!this.isConnected || !this.client) return null;

        try {
            const data = await this.client.get(key);
            if (data) {
                console.log(`Cache HIT: ${key}`);
                return JSON.parse(data);
            }
            console.log(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            console.warn('Redis GET error:', error.message);
            return null;
        }
    }

    /**
     * Set cached value with TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in seconds
     */
    async set(key, value, ttl = this.defaultTTL) {
        if (!this.isConnected || !this.client) return false;

        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
            console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
            return true;
        } catch (error) {
            console.warn('Redis SET error:', error.message);
            return false;
        }
    }

    /**
     * Delete cached value
     * @param {string} key - Cache key
     */
    async del(key) {
        if (!this.isConnected || !this.client) return false;

        try {
            await this.client.del(key);
            console.log(`Cache DEL: ${key}`);
            return true;
        } catch (error) {
            console.warn('Redis DEL error:', error.message);
            return false;
        }
    }

    /**
     * Invalidate all keys matching pattern
     * @param {string} pattern - Pattern to match (e.g., 'services:*')
     */
    async invalidatePattern(pattern) {
        if (!this.isConnected || !this.client) return false;

        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
                console.log(`Cache INVALIDATE: ${pattern} (${keys.length} keys)`);
            }
            return true;
        } catch (error) {
            console.warn('Redis INVALIDATE error:', error.message);
            return false;
        }
    }
}

// Singleton instance
const cache = new RedisCache();

module.exports = cache;
