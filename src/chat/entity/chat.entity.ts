import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entity/user.entity";
import { BaseTable } from "src/common/entity/base-table.entity";
import { ChatRoom } from "./chat-room.entity";

@Entity()
export class Chat extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(
        () => User,
        (user) => user.chats
    )
    author: User;

    @Column()
    message: string;

    @ManyToOne(
        ()=> ChatRoom,
        (chatRoom) => chatRoom.chats
    )
    chatRoom: ChatRoom;
}