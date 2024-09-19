import { Reflector } from "@nestjs/core";
import { Role } from "src/user/entity/user.entity";

export const RBAC = Reflector.createDecorator<Role>();