import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    name?: string;
}
