import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from './entity/user.entity';
import { CommonModule } from 'src/common/common.module';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   User,
    // ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      }
    ]),
    CommonModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
