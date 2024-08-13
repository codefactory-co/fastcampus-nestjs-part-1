import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { envVariableKeys } from "src/common/const/env.const";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        /// Basic $token
        /// Bearer $token
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            next();
            return;
        }

        try {
            const token = this.validateBearerToken(authHeader);

            const decodedPayload = this.jwtService.decode(token);

            if(decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access'){
                throw new UnauthorizedException('잘못된 토큰입니다!');
            }

            const secretKey = decodedPayload.type === 'refresh' ?
                envVariableKeys.refreshTokenSecret :
                envVariableKeys.accessTokenSecret;

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(
                    secretKey,
                ),
            });

            req.user = payload;
            next();
        } catch (e) {
            next();
        }
    }

    validateBearerToken(rawToken: string) {
        const basicSplit = rawToken.split(' ');

        if (basicSplit.length !== 2) {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }

        const [bearer, token] = basicSplit;

        if (bearer.toLowerCase() !== 'bearer') {
            throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
        }

        return token;
    }
}