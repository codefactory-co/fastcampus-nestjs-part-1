import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './schema/director.schema';
import { Repository } from 'typeorm';
import { PrismaService } from 'src/common/prisma.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DirectorService {
  constructor(
    // @InjectRepository(Director)
    // private readonly directorRepository: Repository<Director>,
    // private readonly prisma: PrismaService,
    @InjectModel(Director.name)
    private readonly directorModel: Model<Director>
  ){}

  create(createDirectorDto: CreateDirectorDto) {
    return this.directorModel.create(createDirectorDto);
    // return this.prisma.director.create({
    //   data:createDirectorDto,
    // });
    // return this.directorRepository.save(createDirectorDto);
  }

  findAll() {
    return this.directorModel.find();
    // return this.prisma.director.findMany();
    // return this.directorRepository.find();
  }

  findOne(id: number) {
    return this.directorModel.findById(id);
    // return this.prisma.director.findUnique({
    //   where:{
    //     id,
    //   }
    // })
    // return this.directorRepository.findOne({
    //   where:{
    //     id,
    //   },
    // })
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.directorModel.findById(id);
    // const director = await this.prisma.director.findUnique({
    //   where:{
    //     id,
    //   },
    // })
    // const director = await this.directorRepository.findOne({
    //   where:{
    //     id,
    //   },
    // });

    if(!director){
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    await this.directorModel.findByIdAndUpdate(id, updateDirectorDto).exec();
    // await this.prisma.director.update({
    //   where:{
    //     id,
    //   },
    //   data:{
    //     ...updateDirectorDto,

    //   }
    // })
    // await this.directorRepository.update(
    //   {
    //     id,
    //   },
    //   {
    //     ...updateDirectorDto,
    //   }
    // );

    const newDirector = await this.directorModel.findById(id);
    // const newDirector = await this.prisma.director.findUnique({
    //   where:{
    //     id,
    //   }, 
    // })
    // const newDirector = await this.directorRepository.findOne({
    //   where:{
    //     id,
    //   },
    // });
    
    return newDirector;
  }

  async remove(id: number) {
    const director = await this.directorModel.findById(id);
    // const director = await this.prisma.director.findUnique({
    //   where:{
    //     id,
    //   },
    // })
    // const director = await this.directorRepository.findOne({
    //   where:{
    //     id,
    //   },
    // });

    if(!director){
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    await this.directorModel.findByIdAndDelete(id);
    // await this.prisma.director.delete({
    //   where:{
    //     id
    //   }
    // })
    // await this.directorRepository.delete(id);

    return id;
  }
}
