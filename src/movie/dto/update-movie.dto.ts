import { ArrayNotEmpty, Contains, Equals, IsAlphanumeric, IsArray, IsBoolean, IsCreditCard, IsDate, IsDateString, IsDefined, IsDivisibleBy, IsEmpty, IsEnum, IsHexColor, IsIn, IsInt, IsLatLong, IsNegative, IsNotEmpty, IsNotIn, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength, Min, MinLength, NotContains, NotEquals, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { CreateMovieDto } from "./create-movie.dto";
import { PartialType } from "@nestjs/mapped-types";

export class UpdateMovieDto extends PartialType(CreateMovieDto){}