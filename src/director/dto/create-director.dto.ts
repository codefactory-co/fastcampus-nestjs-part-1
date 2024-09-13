import { Type } from "class-transformer";
import { IsDate, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsDate()
    dob: Date;

    @IsNotEmpty()
    @IsString()
    nationality: string;
}
