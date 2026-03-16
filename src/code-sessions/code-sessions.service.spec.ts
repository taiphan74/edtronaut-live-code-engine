import { Test, TestingModule } from '@nestjs/testing';
import { CodeSessionsService } from './code-sessions.service';

describe('CodeSessionsService', () => {
  let service: CodeSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeSessionsService],
    }).compile();

    service = module.get<CodeSessionsService>(CodeSessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
