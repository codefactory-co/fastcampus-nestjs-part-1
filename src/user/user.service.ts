import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { NotFoundError } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { envVariableKeys } from 'src/common/const/env.const';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일 입니다!');
    }

    const hash = await bcrypt.hash(password, this.configService.get<number>(envVariableKeys.hashRounds))

    await this.userRepository.save({
      email,
      password: hash,
    });

    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      }
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const {password} = updateUserDto;

    const user = await this.userRepository.findOne({
      where: {
        id,
      }
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }

    const hash = await bcrypt.hash(password, this.configService.get<number>(envVariableKeys.hashRounds));

    await this.userRepository.update(
      { id },
      {
        ...updateUserDto,
        password:hash,
      },
    );

    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      }
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }

    await this.userRepository.delete(id);

    return id;
  }
}
