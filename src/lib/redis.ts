import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            retryStrategy(times) {
                if (times > 1) return null; // Give up after 1 retry
                return Math.min(times * 50, 500);
            },
            lazyConnect: true, // Don't connect until first command
            connectTimeout: 5000,
        });

        redisClient.on('error', (err) => {
            console.warn('Redis connection error:', err.message);
        });
    }
    return redisClient;
}

export const redis = {
    async get(key: string): Promise<string | null> {
        try {
            const client = getRedisClient();
            await client.connect().catch(() => { }); // Ignore connect errors
            return await client.get(key);
        } catch (err) {
            console.warn('Redis get failed:', err);
            return null;
        }
    }
};
