import { CreateDateColumn, UpdateDateColumn, VersionColumn } from "typeorm";

export class BaseTable{
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @VersionColumn()
    version: number;
}