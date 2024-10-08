import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: '영화 제목',
        example: '겨울왕국',
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: '영화 설명',
        example: '3시간 훅가쥬?'
    })
    detail: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: '감독 객체 ID',
        example: 1,
    })
    directorId: string;

    @ArrayNotEmpty()
    @IsString({
        each: true,
    })
    @Type(() => String)
    @ApiProperty({
        description: '장르 IDs',
        example: [1,2,3],
    })
    genreIds: string[];

    @IsString()
    @ApiProperty({
        description: '영화 파일 이름',
        example: 'aaa-bbb-ccc-ddd.jpg'
    })
    movieFileName: string;
}