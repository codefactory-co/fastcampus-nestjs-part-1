import { Reflector } from "@nestjs/core";

export const Throttle = Reflector.createDecorator<{
    count: number,
    unit: 'minute'
}>();