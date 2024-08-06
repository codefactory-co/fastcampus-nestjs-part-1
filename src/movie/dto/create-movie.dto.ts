import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMovieDto{
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    genre: string;

    @IsNotEmpty()
    detail: string;

    @IsNotEmpty()
    directorId: number;
}