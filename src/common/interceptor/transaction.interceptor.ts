import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();

        const qr = this.dataSource.createQueryRunner();

        await qr.connect();
        await qr.startTransaction();

        req.queryRunner = qr;

        return next.handle()
            .pipe(
                catchError(
                    async (e)=>{
                        await qr.rollbackTransaction();
                        await qr.release();

                        throw e;
                    }
                ),
                tap(async ()=> {
                    await qr.commitTransaction();
                    await qr.release();
                }),
            );
    }
}