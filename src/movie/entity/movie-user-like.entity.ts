import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Movie } from "./movie.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
export class MovieUserLike {

    @PrimaryColumn({
        name: 'movieId',
        type: 'int8',
    })
    @ManyToOne(
        ()=> Movie,
        (movie) => movie.likedUsers,
    )
    movie: Movie;

    @PrimaryColumn({
        name: 'userId',
        type: 'int8'
    })
    @ManyToOne(
        ()=> User,
        (user) => user.likedMovies,
    )
    user: User;

    @Column()
    isLike: boolean;
}