import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';

@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ){}

  async findAll(title?: string){
    /// 나중에 title 필터 기능 추가하기
    if(!title){
      return [await this.movieRepository.find(), await this.movieRepository.count()];
    }

    return this.movieRepository.findAndCount({
      where:{
        title: Like(`%${title}%`),
      },
    });
  }

  async findOne(id: number){
    const movie = await this.movieRepository.findOne({
      where:{
        id,
      },
      relations: ['detail']
    });

    if(!movie){
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto){
    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        detail: createMovieDto.detail,
      },
    });

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto){
    const movie = await this.movieRepository.findOne({
      where:{
        id,
      },
      relations: ['detail']
    });

    if(!movie){
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    const {detail, ...movieRest} = updateMovieDto;

    await this.movieRepository.update(
      {id},
      movieRest,
    );

    if(detail){
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        }
      )
    }

    const newMovie = await this.movieRepository.findOne({
      where:{
        id,
      },
      relations: ['detail']
    });

    return newMovie;
  }
  
  async remove(id: number){
    const movie = await this.movieRepository.findOne({
      where:{
        id,
      },
      relations: ['detail']
    });

    if(!movie){
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
