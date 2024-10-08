import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { RBAC } from "../decorator/rbac.decorator";
import { Role } from '@prisma/client';

@Injectable()
export class RBACGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const role = this.reflector.get<Role>(RBAC, context.getHandler());

        /// Role Enum에 해당되는 값이 데코레이터에 들어갔는지 확인하기!
        if (!Object.values(Role).includes(role)) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;

        if (!user) {
            return false;
        }

        const roleAccessLevel = {
            [Role.admin]: 0,
            [Role.paidUser]: 1,
            [Role.user]: 2,
        }

        return roleAccessLevel[user.role] <= roleAccessLevel[role];
    }
}