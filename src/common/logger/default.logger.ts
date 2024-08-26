import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class DefaultLogger extends ConsoleLogger{
    warn(message: unknown, ...rest: unknown[]): void {
        console.log('---- WARN LOG ----');
        super.warn(message, ...rest);
    }

    error(message: unknown, ...rest: unknown[]): void {
        console.log('---- ERROR LOG ----');
        super.error(message, ...rest);
    }
}