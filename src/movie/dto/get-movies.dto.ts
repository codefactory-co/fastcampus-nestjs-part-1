import { IsInt, IsOptional, IsString } from "class-validator";
import { CursorPaginationDto } from "src/common/dto/cursor-pagination.dto";
import { PagePaginationDto } from "src/common/dto/page-pagination.dto";

export class GetMoviesDto extends CursorPaginationDto{
    @IsString()
    @IsOptional()
    title?: string;
}