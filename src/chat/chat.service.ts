import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { ChatRoom } from './entity/chat-room.entity';
import { Repository } from 'typeorm';
import { Chat } from './entity/chat.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class ChatService {
    private readonly connectedClients = new Map<number, Socket>();

    constructor(
        @InjectRepository(ChatRoom)
        private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {

    }

    registerClient(userId: number, client: Socket) {
        this.connectedClients.set(userId, client);
    }

    removeClient(userId: number) {
        this.connectedClients.delete(userId);
    }

    async joinUserRooms(user: { sub: number }, client: Socket) {
        const chatRooms = await this.chatRoomRepository.createQueryBuilder('chatRoom')
            .innerJoin('chatRoom.users', 'user', 'user.id = :userId', {
                userId: user.sub,
            })
            .getMany();

        chatRooms.forEach((room)=>{
            client.join(room.id.toString());
        });
    }
}
