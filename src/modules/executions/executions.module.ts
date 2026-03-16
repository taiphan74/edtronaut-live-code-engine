import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionEvent } from './entities/execution-event.entity';
import { Execution } from './entities/execution.entity';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Execution, ExecutionEvent])],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
