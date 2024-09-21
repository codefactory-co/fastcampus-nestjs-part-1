import { Module } from "@nestjs/common";
import { ThumbnailGenerationProcess } from "./thumbnail-generation.worker";

@Module({
    providers: [ThumbnailGenerationProcess]
})
export class WorkerModule{}