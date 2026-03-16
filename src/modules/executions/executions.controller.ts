import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ExecutionsService } from './executions.service';

@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get(':executionId')
  getExecution(
    @Param('executionId', new ParseUUIDPipe()) executionId: string,
  ) {
    return this.executionsService.getExecution(executionId);
  }
}
