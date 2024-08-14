import { BadRequestException, Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePaginationDto } from "./dto/page-pagination.dto";
import { CursorPaginationDto } from "./dto/cursor-pagination.dto";

@Injectable()
export class CommonService{
    constructor(){}

    applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto){
        const {page, take} = dto;

        const skip = (page - 1) * take;

        qb.take(take);
        qb.skip(skip);
    }

    applyCursorPaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto){
        const {cursor, take, order} = dto;

        if(cursor){

        }

        // ["likeCount_DESC", "id_DESC"]
        for(let i = 0; i < order.length; i++){
            const [column, direction] = order[i].split('_');

            if(direction !== 'ASC' && direction !== 'DESC'){
                throw new BadRequestException('Order는 ASC 또는 DESC으로 입력해주세요!');
            }

            if(i === 0){
                qb.orderBy(`${qb.alias}.${column}`, direction)
            }else{
                qb.addOrderBy(`${qb.alias}.${column}`, direction);
            }
        }

        qb.take(take);
    }
}