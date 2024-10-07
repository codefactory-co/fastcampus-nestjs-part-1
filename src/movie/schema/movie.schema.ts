import { Document, Types } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from 'src/user/schema/user.schema';
import { MovieDetail } from "./movie-detail.schema";
import { MovieUserLike } from "./movie-user-like.schema";
import { Genre } from "src/genre/schema/genre.schema";
import { Director } from "src/director/schema/director.schema";

@Schema({
    timestamps: true,
})
export class Movie extends Document {
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
    creator: User;

    @Prop({
        unique: true,
        required: true,
    })
    title: string;

    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'Genre'
        }]
    })
    genres: Genre[];

    @Prop({
        default: 0
    })
    likeCount: number;

    @Prop({
        default: 0
    })
    dislikeCount: number;

    @Prop({
        type: Types.ObjectId,
        ref: 'MovieDetail',
        required: true,
    })
    detail: MovieDetail;

    @Prop({
        required: true,
    })
    movieFilePath: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'Director',
        required: true,
    })
    director: Director;

    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'MovieUserLike'
        }]
    })
    likedUsers: MovieUserLike[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);