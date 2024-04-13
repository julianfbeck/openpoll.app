import Redis from 'ioredis';

export const redisClient = new Redis({
  host: 'localhost',
  port: 6379
});
