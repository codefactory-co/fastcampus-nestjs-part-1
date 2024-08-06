import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDirectorDto {
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    name?: string;

    @IsNotEmpty()
    @IsDateString()
    @IsOptional()
    dob?: Date;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    nationality?: string;
}
