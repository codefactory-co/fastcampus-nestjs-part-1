import { Module } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorController } from './director.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Director,
      ]
    ),
    CommonModule,
  ],
  controllers: [DirectorController],
  providers: [DirectorService],
})
export class DirectorModule { }
