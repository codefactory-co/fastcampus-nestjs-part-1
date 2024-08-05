import { Test, TestingModule } from '@nestjs/testing';
import { DirectorService } from './director.service';

describe('DirectorService', () => {
  let service: DirectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectorService],
    }).compile();

    service = module.get<DirectorService>(DirectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
