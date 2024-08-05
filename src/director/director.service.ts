import { Injectable } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';

@Injectable()
export class DirectorService {
  create(createDirectorDto: CreateDirectorDto) {
    return 'This action adds a new director';
  }

  findAll() {
    return `This action returns all director`;
  }

  findOne(id: number) {
    return `This action returns a #${id} director`;
  }

  update(id: number, updateDirectorDto: UpdateDirectorDto) {
    return `This action updates a #${id} director`;
  }

  remove(id: number) {
    return `This action removes a #${id} director`;
  }
}
