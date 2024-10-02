import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";

export const RBAC = Reflector.createDecorator<Role>();