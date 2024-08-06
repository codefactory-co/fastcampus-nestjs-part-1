import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateDirectorDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsDateString()
    dob: Date;

    @IsNotEmpty()
    @IsString()
    nationality: string;
}
