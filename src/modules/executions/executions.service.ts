import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Execution } from './entities/execution.entity';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(Execution)
    private readonly executionsRepository: Repository<Execution>,
  ) {}

  async getExecution(executionId: string): Promise<Execution> {
    const execution = await this.executionsRepository.findOne({
      where: { id: executionId },
      relations: {
        events: true,
      },
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} was not found.`);
    }

    return execution;
  }
}
