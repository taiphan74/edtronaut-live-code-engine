import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Execution } from '../executions/entities/execution.entity';
import { CodeSession } from './entities/code-session.entity';
import { CodeSessionsController } from './code-sessions.controller';
import { CodeSessionsService } from './code-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([CodeSession, Execution])],
  controllers: [CodeSessionsController],
  providers: [CodeSessionsService],
  exports: [CodeSessionsService],
})
export class CodeSessionsModule {}
