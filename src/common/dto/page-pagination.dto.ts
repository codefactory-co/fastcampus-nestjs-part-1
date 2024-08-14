import { IsInt, IsOptional } from "class-validator";

export class PagePaginationDto {
    @IsInt()
    @IsOptional()
    page: number = 1;

    @IsInt()
    @IsOptional()
    take: number = 5;
}