import { Controller, Request, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, ParseIntPipe, BadRequestException, NotFoundException, ParseFloatPipe, ParseBoolPipe, ParseArrayPipe, ParseUUIDPipe, ParseEnumPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  getMovies(
    @Query('title', MovieTitleValidationPipe) title?: string,
  ){
    /// title 쿼리의 타입이 string 타입인지?
    return this.movieService.findAll(title);
  }

  @Get(':id')
  getMovie(
    @Param('id', ParseIntPipe) id: number,
  ){
    return this.movieService.findOne(id);
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
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ){
    return this.movieService.update(
      +id,
      body,
    );
  }

  @Delete(':id')
  deleteMovie(
    @Param('id', ParseIntPipe) id: string,
  ){
    return this.movieService.remove(
      +id,
    );
  }
}
