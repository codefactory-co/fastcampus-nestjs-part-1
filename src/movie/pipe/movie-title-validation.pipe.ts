import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string>{
    transform(value: string, metadata: ArgumentMetadata): string {
        /// 만약에 글자 길이가 2보다 작거나 같으면 에러 던지기!
        if(value.length <= 2){
            throw new BadRequestException('영화의 제목은 3자 이상 작성해주세요!');
        }

        return value;
    }
}