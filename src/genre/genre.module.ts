import { Module } from '@nestjs/common';
import { GenreService } from './genre.service';
import { GenreController } from './genre.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Genre } from './entity/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { Genre, GenreSchema } from './schema/genre.schema';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   Genre,
    // ]),
    MongooseModule.forFeature([
      {
        name: Genre.name,
        schema: GenreSchema,
      }
    ]),
    CommonModule,
  ],
  controllers: [GenreController],
  providers: [GenreService],
})
export class GenreModule { }
