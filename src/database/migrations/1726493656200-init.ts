import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1726493656200 implements MigrationInterface {
    name = 'Init1726493656200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movie_detail" ("id" SERIAL NOT NULL, "detail" character varying NOT NULL, CONSTRAINT "PK_e3014d1b25dbc9648b9abc58537" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "director" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "dob" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, CONSTRAINT "PK_b85b179882f31c43324ef124fea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "genre" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_dd8cd9e50dd049656e4be1f7e8c" UNIQUE ("name"), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" integer NOT NULL DEFAULT '2', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movie" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "id" SERIAL NOT NULL, "title" character varying NOT NULL, "likeCount" integer NOT NULL DEFAULT '0', "dislikeCount" integer NOT NULL DEFAULT '0', "movieFilePath" character varying NOT NULL, "creatorId" integer, "detailId" integer NOT NULL, "directorId" integer NOT NULL, CONSTRAINT "UQ_a81090ad0ceb645f30f9399c347" UNIQUE ("title"), CONSTRAINT "REL_87276a4fc1647d6db559f61f89" UNIQUE ("detailId"), CONSTRAINT "PK_cb3bb4d61cf764dc035cbedd422" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movie_user_like" ("movieId" integer NOT NULL, "userId" integer NOT NULL, "isLike" boolean NOT NULL, CONSTRAINT "PK_55397b3cefaa6fc1b47370fe84e" PRIMARY KEY ("movieId", "userId"))`);
        await queryRunner.query(`CREATE TABLE "movie_genres_genre" ("movieId" integer NOT NULL, "genreId" integer NOT NULL, CONSTRAINT "PK_aee18568f9fe4ecca74f35891af" PRIMARY KEY ("movieId", "genreId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_985216b45541c7e0ec644a8dd4" ON "movie_genres_genre" ("movieId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1996ce31a9e067304ab168d671" ON "movie_genres_genre" ("genreId") `);
        await queryRunner.query(`ALTER TABLE "movie" ADD CONSTRAINT "FK_b55916de756e46290d52c70fc04" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie" ADD CONSTRAINT "FK_87276a4fc1647d6db559f61f89a" FOREIGN KEY ("detailId") REFERENCES "movie_detail"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie" ADD CONSTRAINT "FK_a32a80a88aff67851cf5b75d1cb" FOREIGN KEY ("directorId") REFERENCES "director"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie_user_like" ADD CONSTRAINT "FK_fd47c2914ce011f6966368c8486" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie_user_like" ADD CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie_genres_genre" ADD CONSTRAINT "FK_985216b45541c7e0ec644a8dd4e" FOREIGN KEY ("movieId") REFERENCES "movie"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movie_genres_genre" ADD CONSTRAINT "FK_1996ce31a9e067304ab168d6715" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movie_genres_genre" DROP CONSTRAINT "FK_1996ce31a9e067304ab168d6715"`);
        await queryRunner.query(`ALTER TABLE "movie_genres_genre" DROP CONSTRAINT "FK_985216b45541c7e0ec644a8dd4e"`);
        await queryRunner.query(`ALTER TABLE "movie_user_like" DROP CONSTRAINT "FK_6a4d1cde9def796ad01b9ede541"`);
        await queryRunner.query(`ALTER TABLE "movie_user_like" DROP CONSTRAINT "FK_fd47c2914ce011f6966368c8486"`);
        await queryRunner.query(`ALTER TABLE "movie" DROP CONSTRAINT "FK_a32a80a88aff67851cf5b75d1cb"`);
        await queryRunner.query(`ALTER TABLE "movie" DROP CONSTRAINT "FK_87276a4fc1647d6db559f61f89a"`);
        await queryRunner.query(`ALTER TABLE "movie" DROP CONSTRAINT "FK_b55916de756e46290d52c70fc04"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1996ce31a9e067304ab168d671"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_985216b45541c7e0ec644a8dd4"`);
        await queryRunner.query(`DROP TABLE "movie_genres_genre"`);
        await queryRunner.query(`DROP TABLE "movie_user_like"`);
        await queryRunner.query(`DROP TABLE "movie"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "genre"`);
        await queryRunner.query(`DROP TABLE "director"`);
        await queryRunner.query(`DROP TABLE "movie_detail"`);
    }

}
