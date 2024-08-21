import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';

@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) { }

  async findAll(dto: GetMoviesDto) {
    const { title } = dto;

    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` })
    }

    const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      nextCursor,
      count,
    }
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')
      .where('movie.id = :id', { id })
      .getOne();

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto, userId: number, qr: QueryRunner) {
    const director = await qr.manager.findOne(Director, {
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
    }

    const genres = await qr.manager.find(Genre, {
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(`존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map(genre => genre.id).join(',')}`);
    }

    const movieDetail = await qr.manager.createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail,
      })
      .execute();

    const movieDetailId = movieDetail.identifiers[0].id;

    const movieFolder = join('public', 'movie');
    const tempFolder = join('public', 'temp');

    const movie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: movieDetailId,
        },
        director,
        creator: {
          id: userId,
        },
        movieFilePath: join(movieFolder, createMovieDto.movieFileName),
      })
      .execute();

    const movieId = movie.identifiers[0].id;

    await qr.manager.createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map(genre => genre.id));

    await rename(
      join(process.cwd(), tempFolder, createMovieDto.movieFileName),
      join(process.cwd(), movieFolder, createMovieDto.movieFileName),
    )

    return await qr.manager.findOne(Movie, {
      where: {
        id: movieId,
      },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {

      const movie = await qr.manager.findOne(Movie, {
        where: {
          id,
        },
        relations: ['detail', 'genres']
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
      }

      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: {
            id: directorId,
          }
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID의 감독입니다!');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: {
            id: In(genreIds),
          },
        });

        if (genres.length !== updateMovieDto.genreIds.length) {
          throw new NotFoundException(`존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map(genre => genre.id).join(',')}`);
        }

        newGenres = genres;
      }

      /**
       * {
       *  ...movieRest,
       *  {director:director}
       * }
       * 
       * {
       *  ...movieRest,
       *  director: director
       * }
       */
      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector })
      }

      await qr.manager.createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id = :id', { id })
        .execute()

      // await this.movieRepository.update(
      //   { id },
      //   movieUpdateFields,
      // );

      if (detail) {
        await qr.manager.createQueryBuilder()
          .update(MovieDetail)
          .set({
            detail,
          })
          .where('id = :id', { id: movie.detail.id })
          .execute();

        // await this.movieDetailRepository.update(
        //   {
        //     id: movie.detail.id,
        //   },
        //   {
        //     detail,
        //   }
        // )
      }

      if (newGenres) {
        await qr.manager.createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(newGenres.map(genre => genre.id), movie.genres.map(genre => genre.id));
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: {
      //     id,
      //   },
      //   relations: ['detail', 'director']
      // });

      // newMovie.genres = newGenres;

      // await this.movieRepository.save(newMovie);
      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres']
      });
    } catch (e) {
      await qr.rollbackTransaction();

      throw e;
    } finally {
      await qr.release();
    }

  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    await this.movieRepository.createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();

    // await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      }
    });

    if (!movie) {
      throw new BadRequestException('존재하지 않는 영화입니다!');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      }
    })

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다!');
    }

    const likeRecord = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update({
          movie,
          user,
        }, {
          isLike,
        })
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      });
    }

    const result = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike,
    }
  }
}
