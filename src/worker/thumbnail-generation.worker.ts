import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { join } from "path";
import { cwd } from "process";
import * as ffmpegFluent from 'fluent-ffmpeg';

@Processor('thumbnail-generation')
export class ThumbnailGenerationProcess extends WorkerHost {
    async process(job: Job, token?: string): Promise<any> {
        const { videoPath, videoId } = job.data;

        console.log(`영상 트랜스코딩중... ID: ${videoId}`);

        const outputDirectory = join(cwd(), 'public', 'thumbnail');

        ffmpegFluent(videoPath)
            .screenshots({
                count: 1,
                filename: `${videoId}.png`,
                folder: outputDirectory,
                size: '320x240',
            })
            .on('end', ()=>{
                console.log(`썸네일 생성 완료! ID: ${videoId}`)
            })
            .on('error', (error)=>{
                console.log(error);
                console.log(`썸네일 생성 실패! ID: ${videoId}`)
            });
    }
}