import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from './common.controller';
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { join } from 'path';
import { v4 } from 'uuid';
import { TasksService } from "./tasks.service";

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                /// ......./Netflix/public/movie
                /// process.cwd() + '/public' + '/movie'
                /// process.cwd() + '\public' + '\movie'
                destination: join(process.cwd(), 'public', 'temp'),
                filename: (req, file, cb) => {
                    const split = file.originalname.split('.');

                    let extension = 'mp4';

                    if (split.length > 1) {
                        extension = split[split.length - 1];
                    }

                    cb(null, `${v4()}_${Date.now()}.${extension}`);
                }
            }),
        }),
    ],
    controllers: [CommonController],
    providers: [CommonService, TasksService],
    exports: [CommonService],
})
export class CommonModule { }