import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateGenreDto {
    @IsNotEmpty()
    @IsOptional()
    name?: string;
}
