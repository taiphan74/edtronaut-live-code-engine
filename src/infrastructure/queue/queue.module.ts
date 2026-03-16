import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { getSharedRedisConnection } from '../redis/redis.client';
import { CODE_EXECUTION_QUEUE, QUEUE_NAME } from './queue.constants';
import { QueueService } from './queue.service';

@Module({
  providers: [
    {
      provide: CODE_EXECUTION_QUEUE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connection = getSharedRedisConnection({
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
        });

        return new Queue(QUEUE_NAME, {
          connection: connection as never,
        });
      },
    },
    QueueService,
  ],
  exports: [QueueService],
})
export class QueueModule {}
