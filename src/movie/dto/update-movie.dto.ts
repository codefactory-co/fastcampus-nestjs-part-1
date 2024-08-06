import { ArrayNotEmpty, Contains, Equals, IsAlphanumeric, IsArray, IsBoolean, IsCreditCard, IsDate, IsDateString, IsDefined, IsDivisibleBy, IsEmpty, IsEnum, IsHexColor, IsIn, IsInt, IsLatLong, IsNegative, IsNotEmpty, IsNotIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, Min, MinLength, NotContains, NotEquals, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

enum MovieGenre{
    Fantasy = 'fantasy',
    Action = 'action',
}

export class UpdateMovieDto{
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    title?: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true,
    })
    @IsOptional()
    genreIds?: number[];

    @IsNotEmpty()
    @IsOptional()
    detail?: string;

    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    directorId?: number;
}