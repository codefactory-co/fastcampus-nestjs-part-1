import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Movie } from "src/movie/schema/movie.schema";
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
})
export class Director extends Document{
    @Prop({
        required: true,
    })
    name: string;

    @Prop({
        required: true,
    })
    dob: Date;

    @Prop({
        required: true,
    })
    nationality: string;

    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'Movie',
        }]
    })
    movies: Movie[];
}

export const DirectorSchema = SchemaFactory.createForClass(Director);