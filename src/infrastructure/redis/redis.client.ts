import Redis, { RedisOptions } from 'ioredis';

let sharedRedisConnection: Redis | null = null;

export function getSharedRedisConnection(options: RedisOptions): Redis {
  if (!sharedRedisConnection) {
    sharedRedisConnection = new Redis({
      ...options,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return sharedRedisConnection;
}

export async function closeSharedRedisConnection(): Promise<void> {
  if (!sharedRedisConnection) {
    return;
  }

  await sharedRedisConnection.quit();
  sharedRedisConnection = null;
}
