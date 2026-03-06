/**
 * Avaloon Hub - Cache Service
 * Simple TTL-based in-memory + localStorage cache for static data lists
 * (clients, team_members, services) that are read frequently but change rarely.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

const memoryCache = {};

export const cacheService = {
    /**
     * Wraps any async fetch function with a simple TTL cache.
     * @param {string} key - Unique cache key
     * @param {Function} fetchFn - Async function that returns fresh data
     * @param {number} ttlMs - Time to live in milliseconds
     */
    withCache: async (key, fetchFn, ttlMs = DEFAULT_TTL_MS) => {
        // 1. Check fast in-memory cache first (no serialization overhead)
        const memoryCached = memoryCache[key];
        if (memoryCached && Date.now() - memoryCached.ts < ttlMs) {
            return memoryCached.data;
        }

        // 2. Fall back to localStorage for cross-reload persistence
        try {
            const stored = localStorage.getItem(`cache_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.ts < ttlMs) {
                    // Warm up the memory cache too
                    memoryCache[key] = parsed;
                    return parsed.data;
                }
            }
        } catch (_) {
            // localStorage not available or parse error — continue to fetch
        }

        // 3. Cache miss: fetch fresh data
        const data = await fetchFn();

        const entry = { data, ts: Date.now() };
        memoryCache[key] = entry;

        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
        } catch (_) {
            // localStorage full or unavailable — memory cache still works
        }

        return data;
    },

    /**
     * Manually invalidate a specific cache key (call this after mutations).
     * Example: after creating or deleting a client, call invalidate('clients')
     */
    invalidate: (key) => {
        delete memoryCache[key];
        try {
            localStorage.removeItem(`cache_${key}`);
        } catch (_) { }
    },

    /**
     * Invalidate all cached keys at once.
     */
    invalidateAll: () => {
        Object.keys(memoryCache).forEach(k => delete memoryCache[k]);
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith('cache_'))
                .forEach(k => localStorage.removeItem(k));
        } catch (_) { }
    },
};

// Convenience shorthand
export const withCache = cacheService.withCache;
export const invalidateCache = cacheService.invalidate;
