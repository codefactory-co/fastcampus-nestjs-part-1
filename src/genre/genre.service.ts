import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
// import { Genre } from './entity/genre.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';
import { PrismaService } from 'src/common/prisma.service';
import { InjectModel } from '@nestjs/mongoose';
import { Genre } from './schema/genre.schema';
import { Model } from 'mongoose';

@Injectable()
export class GenreService {
  constructor(
    // @InjectRepository(Genre)
    // private readonly genreRepository: Repository<Genre>,
    // private readonly prisma: PrismaService,
    @InjectModel(Genre.name)
    private readonly genreModel: Model<Genre>,
  ) { }

  async create(createGenreDto: CreateGenreDto) {
    // const genre = await this.genreRepository.findOne({
    //   where:{
    //     name: createGenreDto.name,
    //   }
    // });

    // if(genre){
    //   throw new NotFoundException('이미 존재하는 장르입니다!');
    // }

    // return {
    //   ...result.toObject(),
    //   _id: result._id.toString(),
    // };

    return this.genreModel.create(createGenreDto);

    // return this.prisma.genre.create({
    //   data: createGenreDto,
    // })
    // return this.genreRepository.save(createGenreDto);
  }

  findAll() {
    return this.genreModel.find().exec();
    // return this.prisma.genre.findMany();
    // return this.genreRepository.find();
  }

  async findOne(id: string) {
    const genre = await this.genreModel.findById(id).exec();
    // const genre = await this.prisma.genre.findUnique({
    //   where: {
    //     id
    //   }
    // });
    // const genre = await this.genreRepository.findOne({
    //   where:{
    //     id,
    //   }
    // });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 장르입니다!');
    }

    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreModel.findById(id).exec();
    // const genre = await this.prisma.genre.findUnique({
    //   where: {
    //     id,
    //   }
    // })
    // const genre = await this.genreRepository.findOne({
    //   where:{
    //     id,
    //   }
    // });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 장르입니다!');
    }

    await this.genreModel.findByIdAndUpdate(id, updateGenreDto).exec();
    // await this.prisma.genre.update({
    //   where: {
    //     id,
    //   },
    //   data: {
    //     ...updateGenreDto,
    //   }
    // })
    // await this.genreRepository.update({
    //   id,
    // }, {
    //   ...updateGenreDto,
    // });

    const newGenre = await this.genreModel.findById(id).exec();
    // const newGenre = await this.prisma.genre.findUnique({
    //   where: {
    //     id,
    //   }
    // })
    // const newGenre = await this.genreRepository.findOne({
    //   where: {
    //     id,
    //   }
    // });

    return newGenre;
  }

  async remove(id: string) {
    const genre = await this.genreModel.findById(id);
    // const genre = await this.prisma.genre.findUnique({
    //   where: {
    //     id,
    //   }
    // })
    // const genre = await this.genreRepository.findOne({
    //   where: {
    //     id,
    //   }
    // });

    if (!genre) {
      throw new NotFoundException('존재하지 않는 장르입니다!');
    }

    await this.genreModel.findByIdAndDelete(id);
    // await this.prisma.genre.delete({
    //   where: { id }
    // })
    // await this.genreRepository.delete(id);

    return id;
  }
}
