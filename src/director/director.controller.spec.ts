import { Test, TestingModule } from '@nestjs/testing';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';

describe('DirectorController', () => {
  let controller: DirectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectorController],
      providers: [DirectorService],
    }).compile();

    controller = module.get<DirectorController>(DirectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
