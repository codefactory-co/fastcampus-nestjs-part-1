import { IsDateString, IsNotEmpty } from "class-validator";

export class CreateDirectorDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsDateString()
    dob: Date;

    @IsNotEmpty()
    nationality: string;
}
