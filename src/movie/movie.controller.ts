import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(
    @Query('title') title?: string,
  ){
    /// title 쿼리의 타입이 string 타입인지?
    return this.movieService.findAll(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: string){
    return this.movieService.findOne(+id);
  }

  @Post()
  postMovie(
    @Body() body: CreateMovieDto,
  ){
    return this.movieService.create(
      body,
    );
  }

  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto,
  ){
    return this.movieService.update(
      +id,
      body,
    );
  }

  @Delete(':id')
  deleteMovie(
    @Param('id') id: string,
  ){
    return this.movieService.remove(
      +id,
    );
  }
}
