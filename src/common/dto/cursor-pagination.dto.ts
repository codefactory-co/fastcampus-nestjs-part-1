import { IsIn, IsInt, IsOptional } from "class-validator";

export class CursorPaginationDto{
    @IsInt()
    @IsOptional()
    id?: number;

    @IsIn(['ASC', 'DESC'])
    @IsOptional()
    order: 'ASC' | 'DESC' = 'DESC';

    @IsInt()
    @IsOptional()
    take: number = 5;
}