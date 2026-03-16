import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeSessionsModule } from './code-sessions/code-sessions.module';
import { ExecutionsModule } from './executions/executions.module';
import { WorkerModule } from './worker/worker.module';
import { SandboxModule } from './sandbox/sandbox.module';

@Module({
  imports: [CodeSessionsModule, ExecutionsModule, WorkerModule, SandboxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
