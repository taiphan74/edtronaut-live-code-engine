import { Module } from '@nestjs/common';
import { CodeSessionsController } from './code-sessions.controller';
import { CodeSessionsService } from './code-sessions.service';

@Module({
  controllers: [CodeSessionsController],
  providers: [CodeSessionsService]
})
export class CodeSessionsModule {}
