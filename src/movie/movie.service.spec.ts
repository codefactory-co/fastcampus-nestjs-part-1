import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { TestBed } from '@automock/jest';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Movie } from './entity/movie.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { CommonService } from 'src/common/common.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { after } from 'node:test';
import { GetMoviesDto } from './dto/get-movies.dto';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

describe('MovieService', () => {
  let movieService: MovieService;
  let movieRepository: jest.Mocked<Repository<Movie>>;
  let movieDetailRepository: jest.Mocked<Repository<MovieDetail>>;
  let directorRepository: jest.Mocked<Repository<Director>>;
  let genreRepository: jest.Mocked<Repository<Genre>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let movieUserLikeRepository: jest.Mocked<Repository<MovieUserLike>>;
  let dataSource: jest.Mocked<DataSource>;
  let commonService: jest.Mocked<CommonService>;
  let cacheManager: Cache;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(MovieService).compile()

    movieService = unit;
    movieRepository = unitRef.get(getRepositoryToken(Movie) as string);
    movieDetailRepository = unitRef.get(getRepositoryToken(MovieDetail) as string);
    directorRepository = unitRef.get(getRepositoryToken(Director) as string);
    genreRepository = unitRef.get(getRepositoryToken(Genre) as string);
    userRepository = unitRef.get(getRepositoryToken(User) as string);
    movieUserLikeRepository = unitRef.get(getRepositoryToken(MovieUserLike) as string);
    dataSource = unitRef.get(DataSource);
    commonService = unitRef.get(CommonService);
    cacheManager = unitRef.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(movieService).toBeDefined();
  });

  afterAll(() => {
    jest.clearAllMocks();
  })

  describe('findRecent', () => {
    it('should return recent movies from cache', async () => {
      const cachedMovies = [{
        id: 1,
        title: 'Movie 1'
      }];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedMovies);

      const result = await movieService.findRecent();

      expect(cacheManager.get).toHaveBeenCalledWith('MOVIE_RECENT');
      expect(result).toEqual(cachedMovies);
    });

    it('should fetch recent movies from the repository and cache them if not found in cache', async () => {
      const recentMovies = [
        {
          id: 1,
          title: 'Movie 1'
        }
      ];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(movieRepository, 'find').mockResolvedValue(recentMovies as Movie[]);

      const result = await movieService.findRecent();

      expect(cacheManager.get).toHaveBeenCalledWith('MOVIE_RECENT');
      expect(cacheManager.set).toHaveBeenCalledWith('MOVIE_RECENT', recentMovies);
      expect(result).toEqual(recentMovies);
    });
  });

  describe('findAll', () => {
    let getMoviesMock: jest.SpyInstance;
    let getLikedMoviesMock: jest.SpyInstance;

    beforeEach(() => {
      getMoviesMock = jest.spyOn(movieService, 'getMovies');
      getLikedMoviesMock = jest.spyOn(movieService, 'getLikedMovies');
    })

    it('should return a list of movies without user likes', async () => {
      const movies = [{
        id: 1,
        title: 'Movie 1'
      }];
      const dto = { title: 'Movie' } as GetMoviesDto;
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([movies, 1]),
      };

      getMoviesMock.mockResolvedValue(qb);
      jest.spyOn(commonService, 'applyCursorPaginationParamsToQb').mockResolvedValue({ nextCursor: null } as any);

      const result = await movieService.findAll(dto);

      expect(getMoviesMock).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith('movie.title LIKE :title', {
        title: '%Movie%',
      });
      expect(commonService.applyCursorPaginationParamsToQb).toHaveBeenCalledWith(qb, dto);
      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        data: movies,
        nextCursor: null,
        count: 1,
      });
    });

    it('should return a list of movies with user likes', async () => {
      const movies = [
        {
          id: 1, title: 'Movie 1'
        },
        {
          id: 3, title: 'Movie 3',
        }
      ];
      const likedMovies = [
        {
          movie: { id: 1 },
          isLike: true
        },
        {
          movie: { id: 2 },
          isLike: false,
        }
      ];
      const dto = { title: 'Movie' } as GetMoviesDto;
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([movies, 1]),
      };

      getMoviesMock.mockResolvedValue(qb);
      jest.spyOn(commonService, 'applyCursorPaginationParamsToQb').mockReturnValue({ nextCursor: null } as any)
      getLikedMoviesMock.mockResolvedValue(likedMovies);

      const userId = 1;
      const result = await movieService.findAll(dto, userId);

      expect(getMoviesMock).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith('movie.title LIKE :title', {
        title: '%Movie%',
      });
      expect(commonService.applyCursorPaginationParamsToQb).toHaveBeenCalledWith(qb, dto);
      expect(qb.getManyAndCount).toHaveBeenCalled();
      expect(getLikedMoviesMock).toHaveBeenCalledWith(
        movies.map(movie => movie.id),
        userId
      );
      expect(result).toEqual({
        data: [
          {
            id: 1,
            title: 'Movie 1',
            likeStatus: true
          },
          {
            id: 3,
            title: 'Movie 3',
            likeStatus: null,
          },
        ],
        nextCursor: null,
        count: 1,
      });
    });

    it('should return movies without title filter', async () => {
      const movies = [{ id: 1, title: 'Movie 1' }];
      const dto = {} as GetMoviesDto;
      const qb: any = {
        getManyAndCount: jest.fn().mockResolvedValue([movies, 1]),
      };

      getMoviesMock.mockResolvedValue(qb);
      jest.spyOn(commonService, 'applyCursorPaginationParamsToQb').mockResolvedValue({
        nextCursor: null,
      } as any);

      const result = await movieService.findAll(dto);

      expect(getMoviesMock).toHaveBeenCalled();
      expect(qb.getManyAndCount).toHaveBeenCalledWith();
      expect(result).toEqual({
        data: movies,
        nextCursor: null,
        count: 1,
      });
    })
  });

  describe('findOne', () => {
    let findMovieDetailMock: jest.SpyInstance;

    beforeEach(() => {
      findMovieDetailMock = jest.spyOn(movieService, 'findMovieDetail');
    });

    it('should reutrn a movie if found', async () => {
      const movie = { id: 1, title: 'Movie 1' };

      findMovieDetailMock.mockResolvedValue(movie);

      const result = await movieService.findOne(1);

      expect(findMovieDetailMock).toHaveBeenCalledWith(1);
      expect(result).toEqual(movie);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      findMovieDetailMock.mockResolvedValue(null);

      await expect(movieService.findOne(1)).rejects.toThrow(NotFoundException);
      expect(findMovieDetailMock).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    let qr: jest.Mocked<QueryRunner>;
    let createMovieDetailMock: jest.SpyInstance;
    let createMovieMock: jest.SpyInstance;
    let createMovieGenreRelationMock: jest.SpyInstance;
    let renameMovieFileMock: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        manager: {
          findOne: jest.fn(),
          find: jest.fn(),
        }
      } as any as jest.Mocked<QueryRunner>;

      createMovieDetailMock = jest.spyOn(movieService, 'createMovieDetail');
      createMovieMock = jest.spyOn(movieService, 'createMovie');
      createMovieGenreRelationMock = jest.spyOn(movieService, 'createMovieGenreRelation');
      renameMovieFileMock = jest.spyOn(movieService, 'renameMovieFile');
    });

    it('should create a movie successfully', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        directorId: 1,
        genreIds: [1, 2],
        detail: 'Some Detail',
        movieFileName: 'mmovie.mp4',
      };
      const userId = 1;
      const director = { id: 1, name: 'Director' };
      const genres = [{ id: 1, name: 'Genre1' }, { id: 2, name: 'Genre2' }];
      const movieDetailInsertResult = { identifiers: [{ id: 1 }] };
      const movieInsertResult = { identifiers: [{ id: 1 }] };

      (qr.manager.findOne as any).mockResolvedValueOnce(director);
      (qr.manager.findOne as any).mockResolvedValueOnce({ ...createMovieDto, id: 1 });
      (qr.manager.find as any).mockResolvedValueOnce(genres);

      createMovieDetailMock.mockResolvedValue(movieDetailInsertResult);
      createMovieMock.mockResolvedValue(movieInsertResult);
      createMovieGenreRelationMock.mockResolvedValue(undefined);
      renameMovieFileMock.mockResolvedValue(undefined);

      const result = await movieService.create(createMovieDto, userId, qr);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Director, {
        where: {
          id: createMovieDto.directorId,
        }
      });
      expect(qr.manager.find).toHaveBeenCalledWith(Genre, {
        where: {
          id: In(createMovieDto.genreIds)
        }
      });
      expect(createMovieDetailMock).toHaveBeenCalledWith(qr, createMovieDto);
      expect(createMovieMock).toHaveBeenCalledWith(qr, createMovieDto, director, movieDetailInsertResult.identifiers[0].id, userId, expect.any(String));
      expect(createMovieGenreRelationMock).toHaveBeenCalledWith(qr, movieInsertResult.identifiers[0].id, genres);
      expect(renameMovieFileMock).toHaveBeenCalledWith(expect.any(String), expect.any(String), createMovieDto);
      expect(result).toEqual({ ...createMovieDto, id: 1 });
    });

    it('should throw NotFoundException if director does not exist', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        directorId: 1,
        genreIds: [1, 2],
        detail: 'Some Detail',
        movieFileName: 'mmovie.mp4',
      };
      const userId = 1;

      (qr.manager.findOne as any).mockResolvedValueOnce(null);

      await expect(movieService.create(createMovieDto, userId, qr)).rejects.toThrow(NotFoundException);
      expect(qr.manager.findOne).toHaveBeenCalledWith(Director, {
        where: {
          id: createMovieDto.directorId,
        }
      });
    });

    it('should throw NotFoundException if some genres do not exist', async () => {
      const createMovieDto: CreateMovieDto = {
        title: 'New Movie',
        directorId: 1,
        genreIds: [1, 2],
        detail: 'Some Detail',
        movieFileName: 'mmovie.mp4',
      };
      const userId = 1;
      const director = {
        id: 1,
        name: 'Director',
      };

      (qr.manager.findOne as any).mockResolvedValueOnce(director);
      (qr.manager.find as any).mockResolvedValueOnce([{
        id: 1,
        name: 'Genre1',
      }]);

      await expect(movieService.create(createMovieDto, userId, qr)).rejects.toThrow(NotFoundException);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Director, {
        where: {
          id: createMovieDto.directorId,
        }
      });
      expect(qr.manager.find).toHaveBeenCalledWith(Genre, {
        where: {
          id: In(createMovieDto.genreIds),
        }
      });
    });
  });

  describe('update', () => {
    let qr: jest.Mocked<QueryRunner>;
    let updateMovieMock: jest.SpyInstance;
    let updateMovieDetailMock: jest.SpyInstance;
    let updateMovieGenreRelationMock: jest.SpyInstance;

    beforeEach(() => {
      qr = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          findOne: jest.fn(),
          find: jest.fn(),
        },
      } as any as jest.Mocked<QueryRunner>;

      updateMovieMock = jest.spyOn(movieService, 'updateMovie');
      updateMovieDetailMock = jest.spyOn(movieService, 'updateMovieDetail');
      updateMovieGenreRelationMock = jest.spyOn(movieService, 'updateMovieGenreRelation');

      jest.spyOn(dataSource, 'createQueryRunner').mockReturnValue(qr);
    });

    it('should update a movie successfully', async () => {
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
        directorId: 1,
        genreIds: [1, 2],
        detail: 'Updated detail',
      };
      const movie = { id: 1, detail: { id: 1 }, genres: [{ id: 1 }, { id: 2 }] };
      const director = { id: 1, name: 'Director' };
      const genres = [{
        id: 1,
        name: 'Genre1',
      }, {
        id: 2,
        name: 'Genre2'
      }];

      (qr.connect as any).mockResolvedValue(null);
      (qr.manager.findOne as any).mockResolvedValueOnce(movie);
      (qr.manager.findOne as any).mockResolvedValueOnce(director);
      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie as Movie);
      (qr.manager.find as any).mockResolvedValueOnce(genres);

      updateMovieMock.mockResolvedValue(undefined);
      updateMovieDetailMock.mockResolvedValue(undefined);
      updateMovieGenreRelationMock.mockResolvedValue(undefined);

      const result = await movieService.update(1, updateMovieDto);

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.findOne).toHaveBeenCalledWith(Movie, {
        where:{id:1},
        relations: ['detail', 'genres'],
      });
      expect(qr.manager.findOne).toHaveBeenCalledWith(Director, {
        where:{
          id: updateMovieDto.directorId,
        }
      });
      expect(qr.manager.find).toHaveBeenCalledWith(Genre, {
        where:{
          id: In(updateMovieDto.genreIds),
        },
      });
      expect(updateMovieMock).toHaveBeenCalledWith(qr, expect.any(Object), 1);
      expect(updateMovieDetailMock).toHaveBeenCalledWith(qr, updateMovieDto.detail, movie);
      expect(updateMovieGenreRelationMock).toHaveBeenCalledWith(qr, 1, genres, movie);
      expect(qr.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(movie);
    });

    it('should throw NotFoundException if movie does not exist', async ()=>{
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
      };

      (qr.manager.findOne as any).mockResolvedValue(null);

      await expect(movieService.update(1, updateMovieDto)).rejects.toThrow(NotFoundException);

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.findOne).toHaveBeenCalledWith(Movie, {
        where:{
          id: 1,
        },
        relations: ['detail', 'genres']
      });
      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if new director does not exist', async ()=>{
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie',
        directorId: 1,
      };

      const movie = {id: 1, detail: {id: 1}, genres: []};

      (qr.manager.findOne as any).mockResolvedValueOnce(movie);
      (qr.manager.findOne as any).mockResolvedValueOnce(null);

      await expect(movieService.update(1, updateMovieDto)).rejects.toThrow(NotFoundException);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Movie, {
        where:{id: 1},
        relations: ['detail', 'genres'],
      });
      expect(qr.manager.findOne).toHaveBeenCalledWith(Director, {
        where:{
          id: updateMovieDto.directorId,
        }
      });
      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if new genres do not exist', async()=>{
      const updateMoviesDto : UpdateMovieDto = {
        title: 'Updated Movie',
        genreIds: [1, 2]
      };
      const movie = {
        id: 1,
        detail: {id: 1,},
        genres: []
      };

      (qr.manager.findOne as any).mockResolvedValueOnce(movie);
      (qr.manager.find as any).mockResolvedValueOnce([{id:1, name: 'Genre1'}]);

      await expect(movieService.update(1, updateMoviesDto)).rejects.toThrow(NotFoundException);

      expect(qr.manager.findOne).toHaveBeenCalledWith(Movie, {
        where:{id:1},
        relations: ['detail', 'genres'],
      });
      expect(qr.manager.find).toHaveBeenCalledWith(Genre, {
        where:{
          id: In(updateMoviesDto.genreIds)
        }
      });
      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction and rethrow error on failure', async ()=>{
      const updateMovieDto: UpdateMovieDto = {
        title: 'Updated Movie'
      };

      (qr.manager.findOne as any).mockRejectedValueOnce(new Error('Database Error'));

      await expect(movieService.update(1, updateMovieDto)).rejects.toThrow('Database Error');

      expect(qr.connect).toHaveBeenCalled();
      expect(qr.startTransaction).toHaveBeenCalled();
      expect(qr.manager.findOne).toHaveBeenCalledWith(Movie, {
        where:{id:1},
        relations: ['detail', 'genres']
      });
      expect(qr.rollbackTransaction).toHaveBeenCalled();
    })
  });

  describe('remove', ()=>{
    let findOneMock: jest.SpyInstance;
    let deleteMovieMock: jest.SpyInstance;
    let dleeteMovieDetailMock : jest.SpyInstance;

    beforeEach(()=>{
      findOneMock = jest.spyOn(movieRepository, 'findOne');
      deleteMovieMock = jest.spyOn(movieService, 'deleteMovie');
      dleeteMovieDetailMock= jest.spyOn(movieDetailRepository, 'delete');
    })

    it('should remove a movie succesfully', async ()=>{
      const movie = {id: 1, detail: {id: 2}};

      findOneMock.mockResolvedValue(movie);
      deleteMovieMock.mockResolvedValue(undefined);
      dleeteMovieDetailMock.mockResolvedValue(undefined);

      const result = await movieService.remove(1);

      expect(findOneMock).toHaveBeenCalledWith({
        where:{id: 1},
        relations: ['detail']
      });
      expect(deleteMovieMock).toHaveBeenCalledWith(1);
      expect(dleeteMovieDetailMock).toHaveBeenCalledWith(movie.detail.id);
      expect(result).toBe(1);
    });

    it('should throw NotFoundException if movie does not exist', async ()=>{
      findOneMock.mockResolvedValue(null);

      await expect(movieService.remove(1)).rejects.toThrow(NotFoundException);

      expect(findOneMock).toHaveBeenCalledWith({
        where:{id: 1},
        relations: ['detail'],
      });
      expect(deleteMovieMock).not.toHaveBeenCalled();
      expect(dleeteMovieDetailMock).not.toHaveBeenCalled();
    });
  });

  describe('toggleMovieLike', ()=>{
    let findOneMovieMock: jest.SpyInstance;
    let findOneUserMock: jest.SpyInstance;
    let getLikedRecordMock: jest.SpyInstance;
    let deleteLikeMock: jest.SpyInstance;
    let updateLikeMock: jest.SpyInstance;
    let saveLikeMock: jest.SpyInstance;

    beforeEach(()=>{
      findOneMovieMock = jest.spyOn(movieRepository, 'findOne');
      findOneUserMock = jest.spyOn(userRepository, 'findOne');
      getLikedRecordMock = jest.spyOn(movieService, 'getLikedRecord');
      deleteLikeMock = jest.spyOn(movieUserLikeRepository, 'delete');
      updateLikeMock = jest.spyOn(movieUserLikeRepository, 'update');
      saveLikeMock = jest.spyOn(movieUserLikeRepository, 'save');
    });

    it('should toggle movie like status succesfully when like record exists and isLike is different', async ()=>{
      const movie = {id: 1};
      const user = {id: 1};
      const likeRecord = {movie, user, isLike: true};

      findOneMovieMock.mockResolvedValue(movie);
      findOneUserMock.mockResolvedValue(user);
      getLikedRecordMock.mockResolvedValueOnce(likeRecord).mockResolvedValueOnce({isLike: false});

      const result = await movieService.toggleMovieLike(1, 1, false);

      expect(findOneMovieMock).toHaveBeenCalledWith({
        where:{id: 1}
      });
      expect(findOneUserMock).toHaveBeenCalledWith({where:{id: 1}});
      expect(getLikedRecordMock).toHaveBeenCalledWith(1, 1);
      expect(updateLikeMock).toHaveBeenCalledWith({
        movie,
        user,
      }, {isLike: false});

      expect(result).toEqual({isLike: false});
    });

    it('should delete like record when isLike is the same as the existing record', async ()=>{
      const movie = {id: 1};
      const user = {id:1};
      const likeRecord = {movie, user, isLike: true};

      findOneMovieMock.mockResolvedValue(movie);
      findOneUserMock.mockResolvedValue(user);
      getLikedRecordMock.mockResolvedValueOnce(likeRecord)
      .mockResolvedValueOnce(null);

      const result = await movieService.toggleMovieLike(1, 1, true);

      expect(findOneMovieMock).toHaveBeenCalledWith({where: {id: 1}});
      expect(findOneUserMock).toHaveBeenCalledWith({where: {id:1}});
      expect(getLikedRecordMock).toHaveBeenCalledWith(1, 1);
      expect(deleteLikeMock).toHaveBeenCalledWith({movie, user});
      expect(result).toEqual({isLike: null});
    });

    it('should save a new like record when no existing record is found', async ()=>{
      const movie = {id: 1};
      const user = {id: 1};

      findOneMovieMock.mockResolvedValue(movie);
      findOneUserMock.mockResolvedValue(user);
      getLikedRecordMock.mockResolvedValueOnce(null)
      .mockResolvedValueOnce({isLike: true});

      const result = await movieService.toggleMovieLike(1, 1, true);

      expect(findOneMovieMock).toHaveBeenCalledWith({where: {id:1}});
      expect(findOneUserMock).toHaveBeenCalledWith({where: {id: 1}});
      expect(getLikedRecordMock).toHaveBeenCalledWith(1, 1);
      expect(saveLikeMock).toHaveBeenCalledWith({movie, user, isLike: true});
      expect(result).toEqual({isLike: true});
    });

    it('should throw BadRequestException if movie does not exist', async ()=>{
      findOneMovieMock.mockResolvedValue(null);

      await expect(movieService.toggleMovieLike(1, 1, true)).rejects.toThrow(BadRequestException);

      expect(findOneMovieMock).toHaveBeenCalledWith({where: {id:1}});
      expect(findOneUserMock).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user does not exist', async ()=>{
      const movie = {id: 1};

      findOneMovieMock.mockResolvedValue(movie);
      findOneUserMock.mockResolvedValue(null);

      await expect(movieService.toggleMovieLike(1, 1, true)).rejects.toThrow(UnauthorizedException);

      expect(findOneMovieMock).toHaveBeenCalledWith({
        where: {id: 1}
      })
      expect(findOneUserMock).toHaveBeenCalledWith({where: {id:1}});
    })
  })
});
