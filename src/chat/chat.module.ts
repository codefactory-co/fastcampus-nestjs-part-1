import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Chat } from './entity/chat.entity';
import { ChatRoom } from './entity/chat-room.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([
    User,
    Chat,
    ChatRoom,
  ])],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
