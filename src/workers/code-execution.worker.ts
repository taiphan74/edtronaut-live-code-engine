import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../app.module';
import {
  closeSharedRedisConnection,
  getSharedRedisConnection,
} from '../infrastructure/redis/redis.client';
import {
  JOB_NAME_RUN_CODE,
  QUEUE_NAME,
} from '../infrastructure/queue/queue.constants';
import { Execution } from '../modules/executions/entities/execution.entity';
import { ExecutionStatus } from '../modules/executions/entities/execution-status.enum';

type RunCodeJobData = {
  executionId: string;
};

const logger = new Logger('CodeExecutionWorker');
const SIMULATED_EXECUTION_TIME_MS = 1000;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function processRunCodeJob(
  job: Job<RunCodeJobData>,
  executionsRepository: Repository<Execution>,
): Promise<void> {
  if (job.name !== JOB_NAME_RUN_CODE) {
    return;
  }

  const { executionId } = job.data;
  logger.log(`Starting job ${job.id} for execution ${executionId}`);

  const execution = await executionsRepository.findOne({
    where: { id: executionId },
  });

  if (!execution) {
    throw new Error(`Execution ${executionId} was not found.`);
  }

  const startedAt = new Date();

  try {
    execution.status = ExecutionStatus.RUNNING;
    execution.startedAt = startedAt;
    await executionsRepository.save(execution);

    await sleep(SIMULATED_EXECUTION_TIME_MS);

    execution.status = ExecutionStatus.COMPLETED;
    execution.finishedAt = new Date();
    execution.stdout = 'Hello from worker';
    execution.stderr = null;
    execution.executionTimeMs = SIMULATED_EXECUTION_TIME_MS;

    await executionsRepository.save(execution);
  } catch (error) {
    execution.status = ExecutionStatus.FAILED;
    execution.finishedAt = new Date();
    execution.stderr =
      error instanceof Error ? error.message : 'Unknown worker error';
    execution.executionTimeMs = execution.startedAt
      ? execution.finishedAt.getTime() - execution.startedAt.getTime()
      : null;

    await executionsRepository.save(execution);
    throw error;
  }
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  const configService = app.get(ConfigService);
  const dataSource = app.get(DataSource);
  const executionsRepository = dataSource.getRepository(Execution);
  const connection = getSharedRedisConnection({
    host: configService.getOrThrow<string>('redis.host'),
    port: configService.getOrThrow<number>('redis.port'),
  });

  const worker = new Worker<RunCodeJobData>(
    QUEUE_NAME,
    async (job) => processRunCodeJob(job, executionsRepository),
    {
      connection: connection as never,
    },
  );

  worker.on('completed', (job) => {
    logger.log(`Completed job ${job.id} (${job.name})`);
  });

  worker.on('failed', (job, error) => {
    logger.error(
      `Failed job ${job?.id ?? 'unknown'} (${job?.name ?? 'unknown'})`,
      error?.stack ?? error?.message,
    );
  });

  const shutdown = async () => {
    await worker.close();
    await closeSharedRedisConnection();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });

  logger.log(`Worker listening on queue ${QUEUE_NAME}`);
}

void bootstrap();
