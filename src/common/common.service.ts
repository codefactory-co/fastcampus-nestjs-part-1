import { Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePaginationDto } from "./dto/page-pagination.dto";

@Injectable()
export class CommonService{
    constructor(){}

    applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto){
        const {page, take} = dto;

        const skip = (page - 1) * take;

        qb.take(take);
        qb.skip(skip);
    }
}