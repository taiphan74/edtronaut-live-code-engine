import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CODE_EXECUTION_QUEUE, JOB_NAME_RUN_CODE } from './queue.constants';

@Injectable()
export class QueueService implements OnModuleDestroy {
  constructor(
    @Inject(CODE_EXECUTION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async enqueueCodeExecution(executionId: string): Promise<void> {
    await this.queue.add(JOB_NAME_RUN_CODE, {
      executionId,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
