import { Controller, Request, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, UsePipes, ValidationPipe, ParseIntPipe, BadRequestException, NotFoundException, ParseFloatPipe, ParseBoolPipe, ParseArrayPipe, ParseUUIDPipe, ParseEnumPipe, DefaultValuePipe, UseGuards, UploadedFile, UploadedFiles, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CacheKey, CacheTTL, CacheInterceptor as CI } from '@nestjs/cache-manager';
import { Throttle } from 'src/common/decorator/throttle.decorator';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get()
  @Public()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  getMovies(
    @Query() dto: GetMoviesDto,
    @UserId() userId?: number,
  ) {
    /// title 쿼리의 타입이 string 타입인지?
    return this.movieService.findAll(dto, userId);
  }

  /// /movie/recent?sdfjiv
  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviesRecent')
  @CacheTTL(1000)
  getMoviesRecent(){
    return this.movieService.findRecent();
  }

  /// /movie/askdjfoixcv
  @Get(':id')
  @Public()
  getMovie(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.movieService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(
      body,
      userId,
      queryRunner,
    );
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(
      +id,
      body,
    );
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(
    @Param('id', ParseIntPipe) id: string,
  ) {
    return this.movieService.remove(
      +id,
    );
  }

  /**
   * [Like] [Dislike]
   * 
   * 아무것도 누르지 않은 상태
   * Like & Dislike 모두 버튼 꺼져있음
   * 
   * Like 버튼 누르면
   * Like 버튼 불 켜짐
   * 
   * Like 버튼 다시 누르면
   * Like 버튼 불 꺼짐
   * 
   * Dislike 버튼 누르면
   * Dislike 버튼 불 켜짐
   * 
   * Dislike 버튼 다시 누르면
   * Dislike 버튼 불 꺼짐
   * 
   * Like 버튼 누름
   * Like 버튼 불 켜짐
   * 
   * Dislike 버튼 누름
   * Like 버튼 불 꺼지고 Dislike 버튼 불 켜짐
   */
  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ){
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ){
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
