import { Exclude } from "class-transformer";
import { BaseTable } from "src/common/entity/base-table.entity";
import { Movie } from "src/movie/entity/movie.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    admin,
    paidUser,
    user,
}

@Entity()
export class User extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    @Exclude({
        toPlainOnly: true,
    })
    password: string;

    @Column({
        enum: Role,
        default: Role.user,
    })
    role: Role;

    @OneToMany(
        () => Movie,
        (movie) => movie.creator,
    )
    createdMovies: Movie[];
}
