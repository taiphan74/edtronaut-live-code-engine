import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionsController } from './executions.controller';

describe('ExecutionsController', () => {
  let controller: ExecutionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionsController],
    }).compile();

    controller = module.get<ExecutionsController>(ExecutionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
