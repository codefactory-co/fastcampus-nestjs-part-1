import { Exclude, Expose, Transform } from "class-transformer";

export class Movie{
    id: number;
    title: string;
    genre: string;
}