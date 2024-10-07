import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Movie } from "src/movie/schema/movie.schema";
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Chat } from "./chat.schema";

@Schema({
    timestamps: true,
})
export class ChatRoom extends Document {
    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'User'
        }]
    })
    users: User[];

    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'Chat',
        }]
    })
    chats: Chat[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);