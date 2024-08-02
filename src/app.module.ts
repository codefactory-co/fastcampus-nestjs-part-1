import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';

@Module({
  imports: [MovieModule],
})
export class AppModule {}
