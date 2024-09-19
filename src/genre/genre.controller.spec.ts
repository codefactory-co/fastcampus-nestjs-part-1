import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from './entity/genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';

const mockGenreService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenreController', () => {
  let controller: GenreController;
  let service: GenreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        {
          provide: GenreService,
          useValue: mockGenreService,
        }
      ],
    }).compile();

    controller = module.get<GenreController>(GenreController);
    service = module.get<GenreService>(GenreService);
  });

  afterEach(()=>{
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', ()=>{
    it('should call genreService.create with correct parameter', async ()=>{
      const createGenreDto = {
        name: 'Fantasy',
      };
      const result = {id: 1, ...createGenreDto};

      jest.spyOn(service, 'create').mockResolvedValue(result as CreateGenreDto & Genre);

      expect(controller.create(createGenreDto)).resolves.toEqual(result);
      expect(service.create).toHaveBeenCalledWith(createGenreDto);
    });
  });

  describe('findAll', ()=>{
    it('should call genreService.findAll and return an array of genres', async ()=>{
      const result = [
        {
          id: 1,
          name: 'Fantasy',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(result as Genre[]);

      expect(controller.findAll()).resolves.toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    })
  });

  describe('findOne', ()=>{
    it('should call genreService.findOne with correct id and return the genre', async ()=>{
      const id = 1;
      const result = {
        id: 1,
        name: 'Fantasy',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result as Genre);

      expect(controller.findOne(id)).resolves.toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', ()=>{
    it('should call genreService.update with correct parameters and return updated genre', async()=>{
      const id = 1;
      const updateGenreDto = {
        name: 'UpdatedFantasy',
      };
      const result = {id: 1, ...updateGenreDto};

      jest.spyOn(service, 'update').mockResolvedValue(result as Genre);

      expect(controller.update(id, updateGenreDto)).resolves.toEqual(result);
      expect(service.update).toHaveBeenCalledWith(id, updateGenreDto);
    });
  });

  describe('remove', ()=>{
    it('should call genreService.remove with correct id and return id of the removed genre', async ()=>{
      const id = 1;

      jest.spyOn(service, 'remove').mockResolvedValue(id);

      expect(controller.remove(id)).resolves.toBe(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    })
  })
});
