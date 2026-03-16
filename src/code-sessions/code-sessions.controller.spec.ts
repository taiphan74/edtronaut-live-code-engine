import { Test, TestingModule } from '@nestjs/testing';
import { CodeSessionsController } from './code-sessions.controller';

describe('CodeSessionsController', () => {
  let controller: CodeSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeSessionsController],
    }).compile();

    controller = module.get<CodeSessionsController>(CodeSessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
