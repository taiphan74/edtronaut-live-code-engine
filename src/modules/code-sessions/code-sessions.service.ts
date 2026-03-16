import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { Execution } from '../executions/entities/execution.entity';
import { ExecutionStatus } from '../executions/entities/execution-status.enum';
import { CreateCodeSessionDto } from './dto/create-code-session.dto';
import { UpdateCodeSessionDto } from './dto/update-code-session.dto';
import { CodeSession } from './entities/code-session.entity';
import { CodeSessionStatus } from './entities/code-session-status.enum';

@Injectable()
export class CodeSessionsService {
  constructor(
    @InjectRepository(CodeSession)
    private readonly codeSessionsRepository: Repository<CodeSession>,
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
    private readonly queueService: QueueService,
  ) {}

  async createSession(
    createCodeSessionDto: CreateCodeSessionDto,
  ): Promise<CodeSession> {
    const codeSession = this.codeSessionsRepository.create({
      language: createCodeSessionDto.language,
      sourceCode: '',
      status: CodeSessionStatus.ACTIVE,
    });

    return this.codeSessionsRepository.save(codeSession);
  }

  async updateSession(
    sessionId: string,
    updateCodeSessionDto: UpdateCodeSessionDto,
  ): Promise<CodeSession> {
    const codeSession = await this.codeSessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!codeSession) {
      throw new NotFoundException(`Code session ${sessionId} was not found.`);
    }

    if (updateCodeSessionDto.language !== undefined) {
      codeSession.language = updateCodeSessionDto.language;
    }

    if (updateCodeSessionDto.sourceCode !== undefined) {
      codeSession.sourceCode = updateCodeSessionDto.sourceCode;
    }

    return this.codeSessionsRepository.save(codeSession);
  }

  async runCode(
    sessionId: string,
  ): Promise<{ executionId: string; status: ExecutionStatus }> {
    const codeSession = await this.codeSessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!codeSession) {
      throw new NotFoundException(`Code session ${sessionId} was not found.`);
    }

    const execution = this.executionsRepository.create({
      sessionId: codeSession.id,
      status: ExecutionStatus.QUEUED,
      queuedAt: new Date(),
    });

    const savedExecution = await this.executionsRepository.save(execution);
    await this.queueService.enqueueCodeExecution(savedExecution.id);

    return {
      executionId: savedExecution.id,
      status: savedExecution.status,
    };
  }
}
