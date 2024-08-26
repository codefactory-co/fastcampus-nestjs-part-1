import { Injectable } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { readdir, unlink } from "fs/promises";
import { join, parse } from 'path';
import { Movie } from "src/movie/entity/movie.entity";
import { Repository } from "typeorm";
import { Logger } from "@nestjs/common";

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) { }

    @Cron('*/5 * * * * *')
    logEverySecond() {
        this.logger.fatal('FATAL 레벨 로그');
        this.logger.error('ERROR 레벨 로그');
        this.logger.warn('WARN 레벨 로그');
        this.logger.log('LOG 레벨 로그');
        this.logger.debug('DEBUG 레벨 로그');
        this.logger.verbose('VERBOSE 레벨 로그');
    }

    // @Cron('* * * * * *')
    async eraseOrphanFiles() {
        const files = await readdir(join(process.cwd(), 'public', 'temp'));

        const deleteFilesTargets = files.filter((file) => {
            const filename = parse(file).name;

            const split = filename.split('_');

            if (split.length !== 2) {
                return true;
            }

            try {
                const date = +new Date(parseInt(split[split.length - 1]));
                const aDayInMilSec = (24 * 60 * 60 * 1000);

                const now = +new Date();

                return (now - date) > aDayInMilSec;

            } catch (e) {
                return true;
            }
        });

        await Promise.all(
            deleteFilesTargets.map(
                (x) => unlink(join(process.cwd(), 'public', 'temp', x))
            )
        );
    }

    // @Cron('0 * * * * *')
    async calculateMovieLikeCounts() {
        console.log('run');
        await this.movieRepository.query(
            `
UPDATE movie m
SET "likeCount" = (
	SELECT count(*) FROM movie_user_like mul
	WHERE m.id = mul."movieId" AND mul."isLike" = true
)`
        )

        await this.movieRepository.query(
            `
UPDATE movie m
SET "dislikeCount" = (
	SELECT count(*) FROM movie_user_like mul
	WHERE m.id = mul."movieId" AND mul."isLike" = false
)
`

        )
    }

    // @Cron('* * * * * *', {
    //     name: 'printer',
    // })
    printer(){
        console.log('print every seconds');
    }

    // @Cron('*/5 * * * * *')
    stopper(){
        console.log('---stopper run---');

        const job = this.schedulerRegistry.getCronJob('printer');

        // console.log('# Last Date');
        // console.log(job.lastDate());
        // console.log('# Next Date');
        // console.log(job.nextDate());
        console.log('# Next Dates');
        console.log(job.nextDates(5));

        if(job.running){
            job.stop();
        }else{
            job.start();
        }
    }
}