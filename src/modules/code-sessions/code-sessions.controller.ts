import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCodeSessionDto } from './dto/create-code-session.dto';
import { UpdateCodeSessionDto } from './dto/update-code-session.dto';
import { CodeSessionsService } from './code-sessions.service';

@Controller('code-sessions')
export class CodeSessionsController {
  constructor(private readonly codeSessionsService: CodeSessionsService) {}

  @Post()
  createSession(@Body() createCodeSessionDto: CreateCodeSessionDto) {
    return this.codeSessionsService.createSession(createCodeSessionDto);
  }

  @Patch(':sessionId')
  updateSession(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
    @Body() updateCodeSessionDto: UpdateCodeSessionDto,
  ) {
    return this.codeSessionsService.updateSession(
      sessionId,
      updateCodeSessionDto,
    );
  }

  @Post(':sessionId/run')
  runCode(@Param('sessionId', new ParseUUIDPipe()) sessionId: string) {
    return this.codeSessionsService.runCode(sessionId);
  }
}
