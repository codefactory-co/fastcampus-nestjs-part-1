import { Reflector } from "@nestjs/core";
import { Role } from "src/user/entities/user.entity";

export const RBAC = Reflector.createDecorator<Role>();